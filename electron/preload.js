const { contextBridge, ipcRenderer } = require('electron')

// 安全暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // 文件/文件夹选择
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: () => ipcRenderer.invoke('select-files'),

  // 游戏项目管理
  getGames: () => ipcRenderer.invoke('get-games'),
  saveGames: (games) => ipcRenderer.invoke('save-games', games),
  addGame: (game) => ipcRenderer.invoke('add-game', game),
  updateGame: (game) => ipcRenderer.invoke('update-game', game),
  deleteGame: (gameId) => ipcRenderer.invoke('delete-game', gameId),

  // Mod 操作
  installMod: (data) => ipcRenderer.invoke('install-mod', data),
  restoreMod: (data) => ipcRenderer.invoke('restore-mod', data),
  restoreAllMods: (data) => ipcRenderer.invoke('restore-all-mods', data),
  deleteModHistory: (data) => ipcRenderer.invoke('delete-mod-history', data),

  // 文件操作
  listDirectory: (dirPath) => ipcRenderer.invoke('list-directory', dirPath),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  pathExists: (filePath) => ipcRenderer.invoke('path-exists', filePath),
  getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath),
  
  // 新增：递归获取文件夹内容
  getDirectoryContents: (dirPath) => ipcRenderer.invoke('get-directory-contents', dirPath)
})