const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')

// 数据存储路径
const dataPath = path.join(app.getPath('userData'), 'GameModManager')
const backupsPath = path.join(dataPath, 'backups')
const gamesFile = path.join(dataPath, 'games.json')

// 确保目录存在
fs.ensureDirSync(dataPath)
fs.ensureDirSync(backupsPath)

let mainWindow

// ========== 游戏数据管理函数 ==========
async function getGames() {
  if (await fs.pathExists(gamesFile)) {
    return await fs.readJson(gamesFile)
  }
  return []
}

async function saveGames(games) {
  await fs.writeJson(gamesFile, games, { spaces: 2 })
}

// ========== 递归扫描目录 ==========
async function scanDirectory(dirPath, basePath = dirPath) {
  const results = []
  try {
    const items = await fs.readdir(dirPath)
    for (const item of items) {
      const fullPath = path.join(dirPath, item)
      const stats = await fs.stat(fullPath).catch(() => null)
      if (!stats) continue
      
      if (stats.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, basePath)
        results.push(...subFiles)
      } else {
        results.push({
          path: fullPath,
          relativePath: path.relative(basePath, fullPath),
          size: stats.size
        })
      }
    }
  } catch {}
  return results
}

// ========== 创建窗口 ==========
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const isDev = process.argv.includes('--dev') || !app.isPackaged
  
  if (isDev) {
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

// 选择文件/文件夹
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections', 'openDirectory'],
    title: '选择文件或文件夹'
  })
  return result.filePaths || []
})

// ========== 游戏项目管理 ==========

ipcMain.handle('get-games', async () => await getGames())

ipcMain.handle('save-games', async (event, games) => {
  await saveGames(games)
  return true
})

ipcMain.handle('add-game', async (event, game) => {
  const games = await getGames()
  game.id = crypto.randomUUID()
  game.createdAt = new Date().toISOString()
  game.mods = []
  game.directories = []
  games.push(game)
  await saveGames(games)
  
  const gameBackupPath = path.join(backupsPath, game.id)
  await fs.ensureDir(gameBackupPath)
  
  return game
})

ipcMain.handle('update-game', async (event, updatedGame) => {
  const games = await getGames()
  const index = games.findIndex(g => g.id === updatedGame.id)
  if (index !== -1) {
    games[index] = { ...games[index], ...updatedGame }
    await saveGames(games)
    return games[index]
  }
  return null
})

ipcMain.handle('delete-game', async (event, gameId) => {
  const games = await getGames()
  await saveGames(games.filter(g => g.id !== gameId))
  await fs.remove(path.join(backupsPath, gameId))
  return true
})

// ========== 文件操作 ==========

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

ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath)
  return true
})

ipcMain.handle('path-exists', async (event, filePath) => fs.pathExists(filePath))

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

// ========== Mod 操作 ==========

async function calculateFileHash(filePath) {
  const content = await fs.readFile(filePath)
  return crypto.createHash('md5').update(content).digest('hex')
}

// 安装 Mod
ipcMain.handle('install-mod', async (event, { 
  gameId, 
  modName, 
  modDescription, 
  sourceItems,
  targetDir 
}) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const modId = crypto.randomUUID()
  const modBackupPath = path.join(backupsPath, gameId, modId)
  await fs.ensureDir(modBackupPath)
  await fs.ensureDir(path.join(modBackupPath, 'originals'))

  const installedFiles = []
  const backupFiles = []
  const errors = []

  // 收集所有文件
  const allFiles = []
  for (const itemPath of sourceItems) {
    try {
      const stats = await fs.stat(itemPath)
      if (stats.isDirectory()) {
        const files = await scanDirectory(itemPath)
        allFiles.push(...files)
      } else {
        allFiles.push({
          path: itemPath,
          relativePath: path.basename(itemPath),
          size: stats.size
        })
      }
    } catch (err) {
      errors.push({ file: itemPath, error: err.message })
    }
  }

  // 处理每个文件
  for (const file of allFiles) {
    try {
      const destPath = path.join(targetDir, file.relativePath)
      
      let operationType = 'new'
      let originalHash = null
      
      await fs.ensureDir(path.dirname(destPath))
      
      if (await fs.pathExists(destPath)) {
        operationType = 'replace'
        originalHash = await calculateFileHash(destPath)
        
        const backupFilePath = path.join(modBackupPath, 'originals', file.relativePath)
        await fs.ensureDir(path.dirname(backupFilePath))
        await fs.copy(destPath, backupFilePath)
        backupFiles.push({
          originalPath: destPath,
          backupPath: backupFilePath,
          relativePath: file.relativePath,
          hash: originalHash
        })
      }

      await fs.copy(file.path, destPath, { overwrite: true })
      
      installedFiles.push({
        sourceFile: file.path,
        destPath,
        relativePath: file.relativePath,
        operationType,
        originalHash,
        newHash: await calculateFileHash(destPath),
        size: file.size
      })
    } catch (err) {
      errors.push({ file: file.path, error: err.message })
    }
  }

  // 创建 Mod 项
  const modItem = {
    id: modId,
    name: modName || `Mod ${(game.mods?.length || 0) + 1}`,
    description: modDescription || '',
    createdAt: new Date().toISOString(),
    targetDir,
    files: installedFiles,
    backupFiles,
    backupPath: modBackupPath,
    stats: {
      total: installedFiles.length,
      new: installedFiles.filter(f => f.operationType === 'new').length,
      replaced: installedFiles.filter(f => f.operationType === 'replace').length
    }
  }

  game.mods = game.mods || []
  game.mods.push(modItem)
  games[gameIndex] = game
  await saveGames(games)

  return { success: true, mod: modItem, errors }
})

// 还原 Mod
ipcMain.handle('restore-mod', async (event, { gameId, modId }) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const modIndex = game.mods?.findIndex(m => m.id === modId)
  if (modIndex === -1) return { success: false, error: 'Mod不存在' }

  const mod = game.mods[modIndex]
  const errors = []

  // 还原被替换的文件
  for (const backupFile of mod.backupFiles || []) {
    try {
      if (await fs.pathExists(backupFile.backupPath)) {
        await fs.copy(backupFile.backupPath, backupFile.originalPath, { overwrite: true })
      }
    } catch (err) {
      errors.push({ file: backupFile.originalPath, error: err.message })
    }
  }

  // 删除新增的文件
  for (const file of mod.files || []) {
    if (file.operationType === 'new') {
      try {
        await fs.remove(file.destPath)
      } catch (err) {
        errors.push({ file: file.destPath, error: err.message })
      }
    }
  }

  game.mods.splice(modIndex, 1)
  games[gameIndex] = game
  await saveGames(games)
  await fs.remove(mod.backupPath)

  return { success: true, errors }
})

// 还原所有 Mod
ipcMain.handle('restore-all-mods', async (event, { gameId }) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  let game = games[gameIndex]
  const errors = []
  
  // 从后往前还原
  while (game.mods && game.mods.length > 0) {
    const mod = game.mods[game.mods.length - 1]
    
    // 还原文件
    for (const backupFile of mod.backupFiles || []) {
      try {
        if (await fs.pathExists(backupFile.backupPath)) {
          await fs.copy(backupFile.backupPath, backupFile.originalPath, { overwrite: true })
        }
      } catch (err) {
        errors.push({ file: backupFile.originalPath, error: err.message })
      }
    }
    
    // 删除新增文件
    for (const file of mod.files || []) {
      if (file.operationType === 'new') {
        try {
          await fs.remove(file.destPath)
        } catch (err) {
          errors.push({ file: file.destPath, error: err.message })
        }
      }
    }
    
    await fs.remove(mod.backupPath)
    game.mods.pop()
  }
  
  games[gameIndex] = game
  await saveGames(games)

  return { success: true, errors }
})

// 删除 Mod 记录
ipcMain.handle('delete-mod-history', async (event, { gameId, modId }) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const modIndex = game.mods?.findIndex(m => m.id === modId)
  if (modIndex === -1) return { success: false, error: 'Mod不存在' }

  await fs.remove(game.mods[modIndex].backupPath)
  game.mods.splice(modIndex, 1)
  games[gameIndex] = game
  await saveGames(games)

  return { success: true }
})