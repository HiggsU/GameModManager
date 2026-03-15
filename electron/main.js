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

// ========== 递归扫描目录（保留完整目录结构） ==========
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
        // 使用 path.relative 确保跨平台兼容
        const relativePath = path.relative(basePath, fullPath)
        results.push({
          path: fullPath,
          relativePath: relativePath,
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
    backgroundColor: '#f0f4f8',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const isDev = process.argv.includes('--dev')

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // 需要调试时按 F12 打开开发者工具
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

// 选择单个文件/文件夹（用于删除操作）
ipcMain.handle('select-item', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'openDirectory', 'multiSelections'],
    title: '选择要删除的文件或文件夹'
  })
  if (result.filePaths && result.filePaths.length > 0) {
    const items = []
    for (const itemPath of result.filePaths) {
      const stats = await fs.stat(itemPath)
      items.push({
        path: itemPath,
        isDirectory: stats.isDirectory()
      })
    }
    return items
  }
  return []
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

// 安装 Mod（支持多目录操作）
ipcMain.handle('install-mod', async (event, data) => {
  console.log('=== install-mod 被调用 ===')
  console.log('接收到的数据:', JSON.stringify(data, null, 2))
  
  const { 
    gameId, 
    modName, 
    modDescription, 
    sourceItems,  // [{ path, relativePath, targetDir }] 
    deleteItems   // [{ path, isDirectory }] 要删除的项目
  } = data
  
  console.log('sourceItems:', sourceItems)
  console.log('deleteItems:', deleteItems)
  
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) {
    console.log('游戏不存在, gameId:', gameId)
    return { success: false, error: '游戏不存在' }
  }

  const game = games[gameIndex]
  console.log('找到游戏:', game.name)
  const modId = crypto.randomUUID()
  const modBackupPath = path.join(backupsPath, gameId, modId)
  await fs.ensureDir(modBackupPath)
  await fs.ensureDir(path.join(modBackupPath, 'originals'))
  await fs.ensureDir(path.join(modBackupPath, 'deleted'))

  const installedFiles = []
  const deletedItems = []  // 记录被删除的文件/目录
  const backupFiles = []
  const errors = []

  // ===== 1. 处理要删除的项目 =====
  for (const item of (deleteItems || [])) {
    try {
      const itemPath = item.path
      if (!await fs.pathExists(itemPath)) {
        errors.push({ file: itemPath, error: '文件或目录不存在' })
        continue
      }
      
      const relativePath = path.relative(game.rootPath, itemPath)
      const backupDest = path.join(modBackupPath, 'deleted', relativePath)
      
      // 备份要删除的内容
      await fs.ensureDir(path.dirname(backupDest))
      
      if (item.isDirectory) {
        // 备份整个目录
        await fs.copy(itemPath, backupDest)
        // 删除目录
        await fs.remove(itemPath)
        deletedItems.push({
          originalPath: itemPath,
          backupPath: backupDest,
          relativePath,
          isDirectory: true
        })
      } else {
        // 备份单个文件
        await fs.copy(itemPath, backupDest)
        await fs.remove(itemPath)
        deletedItems.push({
          originalPath: itemPath,
          backupPath: backupDest,
          relativePath,
          isDirectory: false
        })
      }
    } catch (err) {
      errors.push({ file: item.path, error: err.message })
    }
  }

  // ===== 2. 处理要添加的文件（支持多目录） =====
  const allFiles = []
  console.log('开始处理 sourceItems, 数量:', sourceItems?.length)
  
  for (const item of (sourceItems || [])) {
    try {
      console.log('处理项目:', item)
      const itemPath = item.path
      const itemRelativePath = item.relativePath || ''
      const itemTargetDir = item.targetDir || game.rootPath  // 默认游戏根目录
      
      const stats = await fs.stat(itemPath)
      console.log('项目状态:', { path: itemPath, isDirectory: stats.isDirectory() })
      
      if (stats.isDirectory()) {
        // 如果是目录，扫描其中的所有文件
        const files = await scanDirectory(itemPath)
        console.log('扫描到的文件:', files.length, '个')
        // 保留拖拽时的相对路径前缀
        for (const file of files) {
          allFiles.push({
            ...file,
            relativePath: itemRelativePath ? path.join(itemRelativePath, file.relativePath) : file.relativePath,
            targetDir: itemTargetDir
          })
        }
      } else {
        // 单个文件
        allFiles.push({
          path: itemPath,
          relativePath: itemRelativePath || path.basename(itemPath),
          targetDir: itemTargetDir,
          size: stats.size
        })
      }
    } catch (err) {
      console.error('处理项目出错:', err)
      errors.push({ file: item.path, error: err.message })
    }
  }

  console.log('收集到的 allFiles 数量:', allFiles.length)

  // 1. 先收集所有涉及的目录，并记录安装前的状态
  const allParentDirs = new Set()
  for (const file of allFiles) {
    const targetDir = file.targetDir || game.rootPath
    const relativePath = file.relativePath || file.name
    
    // 收集所有父目录
    const parts = relativePath.split(/[\\/]/)
    if (parts.length > 1) {
      let currentPath = targetDir
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = path.join(currentPath, parts[i])
        allParentDirs.add(currentPath)
      }
    }
  }
  
  // 记录安装前已存在的目录
  const existingDirs = new Set()
  for (const dirPath of allParentDirs) {
    if (await fs.pathExists(dirPath)) {
      existingDirs.add(dirPath)
    }
  }
  
  // 2. 处理每个文件
  for (const file of allFiles) {
    try {
      const targetDir = file.targetDir || game.rootPath
      // 使用相对路径构建目标路径，保留目录结构
      const destPath = path.join(targetDir, file.relativePath)
      
      let operationType = 'new'
      let originalHash = null
      
      // 确保目标目录存在
      await fs.ensureDir(path.dirname(destPath))
      
      if (await fs.pathExists(destPath)) {
        operationType = 'replace'
        originalHash = await calculateFileHash(destPath)
        
        // 备份原文件
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

      // 复制 mod 文件
      await fs.copy(file.path, destPath, { overwrite: true })
      
      installedFiles.push({
        sourceFile: file.path,
        destPath,
        relativePath: file.relativePath,
        targetDir,
        operationType,
        originalHash,
        newHash: await calculateFileHash(destPath),
        size: file.size
      })
    } catch (err) {
      errors.push({ file: file.path, error: err.message })
    }
  }
  
  // 3. 记录新创建的目录（安装前不存在的目录）
  const createdDirs = []
  for (const dirPath of allParentDirs) {
    if (!existingDirs.has(dirPath)) {
      const targetDir = allFiles.find(f => {
        const td = f.targetDir || game.rootPath
        return dirPath.startsWith(td) && dirPath !== td
      })?.targetDir || game.rootPath
      
      createdDirs.push({
        path: dirPath,
        relativePath: path.relative(targetDir, dirPath),
        targetDir
      })
    }
  }

  // 3. 保存 mod 文件副本（用于重新安装）
  const modFilesPath = path.join(modBackupPath, 'modfiles')
  await fs.ensureDir(modFilesPath)
  
  for (const file of allFiles) {
    try {
      const modFileDest = path.join(modFilesPath, file.relativePath)
      await fs.ensureDir(path.dirname(modFileDest))
      await fs.copy(file.path, modFileDest)
    } catch (err) {
      console.error('备份 mod 文件失败:', err)
    }
  }

  // 创建 Mod 项
  const modItem = {
    id: modId,
    name: modName || `Mod ${(game.mods?.length || 0) + 1}`,
    description: modDescription || '',
    createdAt: new Date().toISOString(),
    installed: true,  // 默认已安装
    files: installedFiles,
    deletedItems,  // 被删除的项目
    backupFiles,
    createdDirs,  // Mod 创建的目录
    backupPath: modBackupPath,
    stats: {
      total: installedFiles.length,
      new: installedFiles.filter(f => f.operationType === 'new').length,
      replaced: installedFiles.filter(f => f.operationType === 'replace').length,
      deleted: deletedItems.length
    }
  }

  game.mods = game.mods || []
  game.mods.push(modItem)
  games[gameIndex] = game
  await saveGames(games)

  return { success: true, mod: modItem, errors }
})

// 删除文件/目录（作为 Mod 操作的一部分）
ipcMain.handle('delete-for-mod', async (event, { gameId, modName, itemsToDelete }) => {
  // itemsToDelete: [{ path, isDirectory }]
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const modId = crypto.randomUUID()
  const modBackupPath = path.join(backupsPath, gameId, modId)
  await fs.ensureDir(modBackupPath)
  await fs.ensureDir(path.join(modBackupPath, 'deleted'))

  const deletedItems = []
  const errors = []

  for (const item of itemsToDelete) {
    try {
      const itemPath = item.path
      const relativePath = path.relative(game.rootPath, itemPath)
      const backupDest = path.join(modBackupPath, 'deleted', relativePath)
      
      // 备份要删除的内容
      await fs.ensureDir(path.dirname(backupDest))
      
      if (item.isDirectory) {
        // 备份整个目录
        await fs.copy(itemPath, backupDest)
        // 删除目录
        await fs.remove(itemPath)
        deletedItems.push({
          originalPath: itemPath,
          backupPath: backupDest,
          relativePath,
          isDirectory: true
        })
      } else {
        // 备份文件
        await fs.copy(itemPath, backupDest)
        // 删除文件
        await fs.remove(itemPath)
        deletedItems.push({
          originalPath: itemPath,
          backupPath: backupDest,
          relativePath,
          isDirectory: false
        })
      }
    } catch (err) {
      errors.push({ path: item.path, error: err.message })
    }
  }

  // 创建 Mod 记录
  const modItem = {
    id: modId,
    name: modName || `删除项 ${(game.mods?.length || 0) + 1}`,
    description: '',
    createdAt: new Date().toISOString(),
    files: [],
    deletedItems,
    backupFiles: [],
    backupPath: modBackupPath,
    stats: {
      total: 0,
      new: 0,
      replaced: 0,
      deleted: deletedItems.length
    }
  }

  game.mods = game.mods || []
  game.mods.push(modItem)
  games[gameIndex] = game
  await saveGames(games)

  return { success: true, mod: modItem, errors }
})

// 还原 Mod（不删除记录，只标记为已还原）
ipcMain.handle('restore-mod', async (event, { gameId, modId }) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const modIndex = game.mods?.findIndex(m => m.id === modId)
  if (modIndex === -1) return { success: false, error: 'Mod不存在' }

  const mod = game.mods[modIndex]
  const errors = []

  // 还原被删除的项目
  for (const deletedItem of mod.deletedItems || []) {
    try {
      if (await fs.pathExists(deletedItem.backupPath)) {
        await fs.ensureDir(path.dirname(deletedItem.originalPath))
        await fs.copy(deletedItem.backupPath, deletedItem.originalPath, { overwrite: true })
      }
    } catch (err) {
      errors.push({ path: deletedItem.originalPath, error: err.message })
    }
  }

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
  console.log('=== 还原 Mod ===')
  console.log('Mod:', mod.name)
  console.log('新增文件数:', mod.files?.filter(f => f.operationType === 'new').length || 0)
  console.log('createdDirs:', mod.createdDirs)
  
  for (const file of mod.files || []) {
    if (file.operationType === 'new') {
      try {
        await fs.remove(file.destPath)
        console.log('已删除文件:', file.destPath)
      } catch (err) {
        errors.push({ file: file.destPath, error: err.message })
      }
    }
  }

  // 清理空目录
  const dirsToClean = []
  
  // 1. 从 createdDirs 收集
  if (mod.createdDirs && mod.createdDirs.length > 0) {
    dirsToClean.push(...mod.createdDirs.map(d => d.path || d))
  }
  
  // 2. 从新增文件的父目录收集
  for (const file of mod.files || []) {
    if (file.operationType === 'new') {
      const targetDir = file.targetDir || game.rootPath
      let parentDir = path.dirname(file.destPath)
      // 向上收集所有父目录（直到目标目录）
      while (parentDir && parentDir !== targetDir && parentDir.length > targetDir.length) {
        if (!dirsToClean.includes(parentDir)) {
          dirsToClean.push(parentDir)
        }
        parentDir = path.dirname(parentDir)
      }
    }
  }
  
  // 从最深层的目录开始清理
  const sortedDirs = dirsToClean.sort((a, b) => b.length - a.length)
  console.log('待清理目录:', sortedDirs)
  
  for (const dirPath of sortedDirs) {
    try {
      if (await fs.pathExists(dirPath)) {
        const contents = await fs.readdir(dirPath).catch(() => null)
        console.log(`检查目录 ${dirPath}:`, contents ? `包含 ${contents.length} 项` : '无法读取')
        if (contents && contents.length === 0) {
          await fs.remove(dirPath)
          console.log('已删除空目录:', dirPath)
        }
      }
    } catch (err) {
      console.log('清理目录出错:', dirPath, err.message)
    }
  }

  // 标记为已还原，不删除记录
  game.mods[modIndex].installed = false
  games[gameIndex] = game
  await saveGames(games)

  return { success: true, errors }
})

// 重新安装 Mod（从备份恢复）
ipcMain.handle('reinstall-mod', async (event, { gameId, modId }) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const modIndex = game.mods?.findIndex(m => m.id === modId)
  if (modIndex === -1) return { success: false, error: 'Mod不存在' }

  const mod = game.mods[modIndex]
  const errors = []
  
  // 检查备份是否存在
  if (!await fs.pathExists(mod.backupPath)) {
    return { success: false, error: '备份文件不存在，无法重新安装' }
  }

  const modFilesPath = path.join(mod.backupPath, 'modfiles')
  
  // 1. 重新删除之前删除的项目
  for (const deletedItem of mod.deletedItems || []) {
    try {
      if (await fs.pathExists(deletedItem.originalPath)) {
        await fs.remove(deletedItem.originalPath)
      }
    } catch (err) {
      errors.push({ path: deletedItem.originalPath, error: err.message })
    }
  }

  // 2. 从 modfiles 恢复文件到目标位置
  if (await fs.pathExists(modFilesPath)) {
    const files = await scanDirectory(modFilesPath)
    for (const file of files) {
      try {
        // 从 mod.files 中找到对应的目标路径
        const modFileInfo = mod.files?.find(f => f.relativePath === file.relativePath)
        const targetDir = modFileInfo?.targetDir || game.rootPath
        const destPath = path.join(targetDir, file.relativePath)
        
        await fs.ensureDir(path.dirname(destPath))
        await fs.copy(file.path, destPath, { overwrite: true })
      } catch (err) {
        errors.push({ file: file.path, error: err.message })
      }
    }
  }

  // 3. 标记为已安装
  game.mods[modIndex].installed = true
  games[gameIndex] = game
  await saveGames(games)

  return { success: true, errors }
})

// 还原所有 Mod（标记为已还原）
ipcMain.handle('restore-all-mods', async (event, { gameId }) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const errors = []
  const allDirsToClean = []
  
  console.log('=== 还原所有 Mod ===')
  
  // 从后往前还原（保持顺序）
  for (let i = game.mods.length - 1; i >= 0; i--) {
    const mod = game.mods[i]
    if (mod.installed === false) continue  // 跳过已还原的
    
    console.log(`处理 Mod: ${mod.name}`)
    
    // 还原被删除的项目
    for (const deletedItem of mod.deletedItems || []) {
      try {
        if (await fs.pathExists(deletedItem.backupPath)) {
          await fs.ensureDir(path.dirname(deletedItem.originalPath))
          await fs.copy(deletedItem.backupPath, deletedItem.originalPath, { overwrite: true })
        }
      } catch (err) {
        errors.push({ path: deletedItem.originalPath, error: err.message })
      }
    }
    
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
    
    // 删除新增文件
    for (const file of mod.files || []) {
      if (file.operationType === 'new') {
        try {
          await fs.remove(file.destPath)
          console.log('已删除文件:', file.destPath)
        } catch (err) {
          errors.push({ file: file.destPath, error: err.message })
        }
      }
    }
    
    // 收集所有需要清理的目录
    // 1. 从 createdDirs
    if (mod.createdDirs && mod.createdDirs.length > 0) {
      for (const d of mod.createdDirs) {
        const dirPath = d.path || d
        if (!allDirsToClean.includes(dirPath)) {
          allDirsToClean.push(dirPath)
        }
      }
    }
    
    // 2. 从新增文件的父目录
    for (const file of mod.files || []) {
      if (file.operationType === 'new') {
        const targetDir = file.targetDir || game.rootPath
        let parentDir = path.dirname(file.destPath)
        while (parentDir && parentDir !== targetDir && parentDir.length > targetDir.length) {
          if (!allDirsToClean.includes(parentDir)) {
            allDirsToClean.push(parentDir)
          }
          parentDir = path.dirname(parentDir)
        }
      }
    }

    // 标记为已还原
    game.mods[i].installed = false
  }

  // 从最深层的目录开始清理空目录
  const sortedDirs = allDirsToClean.sort((a, b) => b.length - a.length)
  console.log('待清理目录:', sortedDirs)
  
  for (const dirPath of sortedDirs) {
    try {
      if (await fs.pathExists(dirPath)) {
        const contents = await fs.readdir(dirPath).catch(() => null)
        console.log(`检查目录 ${dirPath}:`, contents ? `包含 ${contents.length} 项` : '无法读取')
        if (contents && contents.length === 0) {
          await fs.remove(dirPath)
          console.log('已删除空目录:', dirPath)
        }
      }
    } catch (err) {
      console.log('清理目录出错:', dirPath, err.message)
    }
  }
  
  games[gameIndex] = game
  await saveGames(games)

  return { success: true, errors }
})

// 删除 Mod 记录（会先检查是否已还原）
ipcMain.handle('delete-mod-history', async (event, { gameId, modId }) => {
  const games = await getGames()
  const gameIndex = games.findIndex(g => g.id === gameId)
  if (gameIndex === -1) return { success: false, error: '游戏不存在' }

  const game = games[gameIndex]
  const modIndex = game.mods?.findIndex(m => m.id === modId)
  if (modIndex === -1) return { success: false, error: 'Mod不存在' }

  // 删除备份文件夹
  await fs.remove(game.mods[modIndex].backupPath)
  
  // 从数组中移除
  game.mods.splice(modIndex, 1)
  games[gameIndex] = game
  await saveGames(games)

  return { success: true }
})