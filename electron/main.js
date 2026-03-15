const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')

// 数据存储路径
const dataPath = path.join(app.getPath('userData'), 'GameModManager')
const gamesPath = path.join(dataPath, 'games')
const backupsPath = path.join(dataPath, 'backups')

// 确保目录存在
fs.ensureDirSync(dataPath)
fs.ensureDirSync(gamesPath)
fs.ensureDirSync(backupsPath)

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.ico')
  })

  // 开发模式
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => mainWindow = null)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

// ========== IPC 处理程序 ==========

// 窗口控制
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.close())

// 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择文件夹'
  })
  return result.filePaths[0] || null
})

// 选择文件
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: '选择文件'
  })
  return result.filePaths || []
})

// ========== 游戏项目管理 ==========

// 获取所有游戏
ipcMain.handle('get-games', async () => {
  const gamesFile = path.join(dataPath, 'games.json')
  if (await fs.pathExists(gamesFile)) {
    return await fs.readJson(gamesFile)
  }
  return []
})

// 保存游戏列表
ipcMain.handle('save-games', async (event, games) => {
  const gamesFile = path.join(dataPath, 'games.json')
  await fs.writeJson(gamesFile, games, { spaces: 2 })
  return true
})

// 添加游戏
ipcMain.handle('add-game', async (event, game) => {
  const games = await (await ipcMain.invoke('get-games')) || []
  game.id = crypto.randomUUID()
  game.createdAt = new Date().toISOString()
  game.modHistory = []
  games.push(game)
  await ipcMain.invoke('save-games', games)
  
  // 为游戏创建备份目录
  const gameBackupPath = path.join(backupsPath, game.id)
  await fs.ensureDir(gameBackupPath)
  
  return game
})

// 更新游戏
ipcMain.handle('update-game', async (event, updatedGame) => {
  const games = await ipcMain.invoke('get-games')
  const index = games.findIndex(g => g.id === updatedGame.id)
  if (index !== -1) {
    games[index] = { ...games[index], ...updatedGame }
    await ipcMain.invoke('save-games', games)
    return games[index]
  }
  return null
})

// 删除游戏
ipcMain.handle('delete-game', async (event, gameId) => {
  const games = await ipcMain.invoke('get-games')
  const filtered = games.filter(g => g.id !== gameId)
  await ipcMain.invoke('save-games', filtered)
  
  // 删除相关备份
  const gameBackupPath = path.join(backupsPath, gameId)
  await fs.remove(gameBackupPath)
  
  return true
})

// ========== Mod 操作 ==========

// 计算文件哈希
async function calculateFileHash(filePath) {
  const content = await fs.readFile(filePath)
  return crypto.createHash('md5').update(content).digest('hex')
}

// 复制文件并保留目录结构
async function copyWithStructure(srcPath, destBase, relativePath) {
  const destPath = path.join(destBase, relativePath)
  await fs.ensureDir(path.dirname(destPath))
  await fs.copy(srcPath, destPath, { overwrite: true })
  return destPath
}

// 安装 Mod
ipcMain.handle('install-mod', async (event, { gameId, sourceFiles, targetDir, targetDirName }) => {
  const games = await ipcMain.invoke('get-games')
  const game = games.find(g => g.id === gameId)
  if (!game) return { success: false, error: '游戏不存在' }

  const gameBackupPath = path.join(backupsPath, gameId)
  const modBackupPath = path.join(gameBackupPath, `mod_${Date.now()}`)
  await fs.ensureDir(modBackupPath)

  const installedFiles = []
  const backupFiles = []
  const errors = []

  for (const sourceFile of sourceFiles) {
    try {
      const fileName = path.basename(sourceFile)
      const destPath = path.join(targetDir, fileName)
      const relativePath = path.relative(game.rootPath, destPath)
      
      // 检查目标是否已存在
      let operationType = 'new'
      let originalHash = null
      
      if (await fs.pathExists(destPath)) {
        operationType = 'replace'
        originalHash = await calculateFileHash(destPath)
        
        // 备份原文件
        const backupFilePath = path.join(modBackupPath, 'originals', relativePath)
        await fs.ensureDir(path.dirname(backupFilePath))
        await fs.copy(destPath, backupFilePath)
        backupFiles.push({
          originalPath: destPath,
          backupPath: backupFilePath,
          relativePath: relativePath,
          hash: originalHash
        })
      }

      // 复制 mod 文件
      await fs.copy(sourceFile, destPath, { overwrite: true })
      
      installedFiles.push({
        sourceFile,
        destPath,
        relativePath,
        operationType,
        originalHash,
        newHash: await calculateFileHash(destPath),
        targetDirName
      })
    } catch (err) {
      errors.push({ file: sourceFile, error: err.message })
    }
  }

  // 记录操作历史
  const historyEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    operation: 'install',
    targetDirName,
    targetDir,
    files: installedFiles,
    backupFiles,
    backupPath: modBackupPath
  }

  game.modHistory = game.modHistory || []
  game.modHistory.push(historyEntry)
  await ipcMain.invoke('save-games', games)

  return {
    success: true,
    installedFiles,
    backupFiles,
    errors,
    historyId: historyEntry.id
  }
})

// 还原 Mod
ipcMain.handle('restore-mod', async (event, { gameId, historyId }) => {
  const games = await ipcMain.invoke('get-games')
  const game = games.find(g => g.id === gameId)
  if (!game) return { success: false, error: '游戏不存在' }

  const historyEntry = game.modHistory.find(h => h.id === historyId)
  if (!historyEntry) return { success: false, error: '历史记录不存在' }

  const errors = []

  // 还原被替换的文件
  for (const backupFile of historyEntry.backupFiles) {
    try {
      if (await fs.pathExists(backupFile.backupPath)) {
        await fs.copy(backupFile.backupPath, backupFile.originalPath, { overwrite: true })
      }
    } catch (err) {
      errors.push({ file: backupFile.originalPath, error: err.message })
    }
  }

  // 删除新增的文件
  for (const file of historyEntry.files) {
    if (file.operationType === 'new') {
      try {
        await fs.remove(file.destPath)
      } catch (err) {
        errors.push({ file: file.destPath, error: err.message })
      }
    }
  }

  // 从历史中移除
  game.modHistory = game.modHistory.filter(h => h.id !== historyId)
  await ipcMain.invoke('save-games', games)

  // 删除备份目录
  await fs.remove(historyEntry.backupPath)

  return { success: true, errors }
})

// 批量还原
ipcMain.handle('restore-all-mods', async (event, { gameId }) => {
  const games = await ipcMain.invoke('get-games')
  const game = games.find(g => g.id === gameId)
  if (!game) return { success: false, error: '游戏不存在' }

  const results = []
  for (const historyEntry of [...game.modHistory].reverse()) {
    const result = await ipcMain.invoke('restore-mod', { gameId, historyId: historyEntry.id })
    results.push({ historyId: historyEntry.id, ...result })
  }

  return { success: true, results }
})

// 删除 Mod 历史（不还原）
ipcMain.handle('delete-mod-history', async (event, { gameId, historyId }) => {
  const games = await ipcMain.invoke('get-games')
  const game = games.find(g => g.id === gameId)
  if (!game) return { success: false, error: '游戏不存在' }

  const historyEntry = game.modHistory.find(h => h.id === historyId)
  if (!historyEntry) return { success: false, error: '历史记录不存在' }

  // 删除备份文件
  await fs.remove(historyEntry.backupPath)

  // 从历史中移除
  game.modHistory = game.modHistory.filter(h => h.id !== historyId)
  await ipcMain.invoke('save-games', games)

  return { success: true }
})

// 获取目录下的文件列表
ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    if (!await fs.pathExists(dirPath)) {
      return { success: false, error: '目录不存在' }
    }
    const files = await fs.readdir(dirPath)
    const fileList = await Promise.all(files.map(async (file) => {
      const filePath = path.join(dirPath, file)
      const stats = await fs.stat(filePath)
      return {
        name: file,
        path: filePath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime
      }
    }))
    return { success: true, files: fileList }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// 打开目录
ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath)
  return true
})

// 检查路径是否存在
ipcMain.handle('path-exists', async (event, filePath) => {
  return fs.pathExists(filePath)
})

// 获取文件信息
ipcMain.handle('get-file-info', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath)
    return {
      exists: true,
      size: stats.size,
      isDirectory: stats.isDirectory(),
      modified: stats.mtime,
      created: stats.birthtime
    }
  } catch {
    return { exists: false }
  }
})