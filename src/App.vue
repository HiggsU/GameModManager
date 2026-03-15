<template>
  <div class="app-container">
    <!-- 自定义标题栏 -->
    <div class="title-bar">
      <div class="title-bar-drag">
        <div class="title-bar-logo">
          <span class="logo-icon">🎮</span>
          <span class="logo-text">Game Mod Manager</span>
        </div>
      </div>
      <div class="title-bar-controls">
        <button class="title-bar-btn minimize" @click="minimizeWindow">
          <svg viewBox="0 0 12 12"><rect y="5" width="12" height="2"/></svg>
        </button>
        <button class="title-bar-btn maximize" @click="maximizeWindow">
          <svg viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </button>
        <button class="title-bar-btn close" @click="closeWindow">
          <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1l-10 10" stroke="currentColor" stroke-width="2"/></svg>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>游戏列表</h3>
          <button class="btn btn-primary btn-sm" @click="showAddGameModal = true">
            <span>+</span> 添加游戏
          </button>
        </div>
        <div class="game-list">
          <div 
            v-for="game in games" 
            :key="game.id"
            class="game-card"
            :class="{ selected: selectedGame?.id === game.id }"
            @click="selectGame(game)"
          >
            <div class="game-icon">{{ getGameIcon(game.name) }}</div>
            <div class="game-info">
              <h4 class="game-name">{{ game.name }}</h4>
              <p class="game-path">{{ truncatePath(game.rootPath) }}</p>
              <div class="game-meta">
                <span class="badge badge-count">{{ game.directories?.length || 0 }} 目录</span>
                <span class="badge badge-count">{{ game.modHistory?.length || 0 }} Mod</span>
              </div>
            </div>
          </div>
          <div v-if="games.length === 0" class="empty-state">
            <div class="empty-state-icon">🎮</div>
            <p class="empty-state-text">还没有添加游戏<br>点击上方按钮开始</p>
          </div>
        </div>
      </aside>

      <!-- 主面板 -->
      <main class="panel">
        <!-- 欢迎界面 -->
        <div v-if="!selectedGame" class="welcome-screen">
          <div class="welcome-content">
            <div class="welcome-icon">🎮</div>
            <h1>Game Mod Manager</h1>
            <p>轻松管理你的游戏 Mod，支持拖拽安装、一键还原</p>
            <div class="welcome-features">
              <div class="feature">
                <span class="feature-icon">📁</span>
                <span>多游戏支持</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🎯</span>
                <span>拖拽安装</span>
              </div>
              <div class="feature">
                <span class="feature-icon">💾</span>
                <span>自动备份</span>
              </div>
              <div class="feature">
                <span class="feature-icon">↩️</span>
                <span>一键还原</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏详情 -->
        <div v-else class="game-detail">
          <!-- 游戏头部信息 -->
          <div class="game-header">
            <div class="game-header-left">
              <span class="game-header-icon">{{ getGameIcon(selectedGame.name) }}</span>
              <div>
                <h2>{{ selectedGame.name }}</h2>
                <p class="game-path-full">{{ selectedGame.rootPath }}</p>
              </div>
            </div>
            <div class="game-header-actions">
              <button class="btn btn-secondary btn-sm" @click="openGameFolder">
                <span>📂</span> 打开目录
              </button>
              <button class="btn btn-ghost btn-sm" @click="showEditGameModal = true">
                <span>⚙️</span> 设置
              </button>
              <button class="btn btn-danger btn-sm" @click="confirmDeleteGame">
                <span>🗑️</span> 删除
              </button>
            </div>
          </div>

          <!-- 标签页 -->
          <div class="tabs">
            <button 
              class="tab" 
              :class="{ active: activeTab === 'mod' }" 
              @click="activeTab = 'mod'"
            >
              <span>🎯</span> 安装 Mod
            </button>
            <button 
              class="tab" 
              :class="{ active: activeTab === 'history' }" 
              @click="activeTab = 'history'"
            >
              <span>📜</span> 历史记录
              <span v-if="selectedGame.modHistory?.length" class="badge badge-count">
                {{ selectedGame.modHistory.length }}
              </span>
            </button>
          </div>

          <!-- Mod 安装面板 -->
          <div v-show="activeTab === 'mod'" class="tab-content">
            <!-- 目标目录选择 -->
            <div class="section">
              <h3 class="section-title">
                <span>📂</span> 目标目录
              </h3>
              <div class="directory-list">
                <div 
                  v-for="dir in selectedGame.directories" 
                  :key="dir.path"
                  class="directory-item"
                  :class="{ selected: selectedDirectory === dir.path }"
                  @click="selectedDirectory = dir.path"
                >
                  <span class="dir-icon">📁</span>
                  <div class="dir-info">
                    <span class="dir-name">{{ dir.name }}</span>
                    <span class="dir-path">{{ truncatePath(dir.path) }}</span>
                  </div>
                  <span v-if="selectedDirectory === dir.path" class="check-icon">✓</span>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm mt-4" @click="showAddDirModal = true">
                <span>+</span> 添加目录
              </button>
            </div>

            <!-- 拖拽区域 -->
            <div class="section">
              <h3 class="section-title">
                <span>🎯</span> 添加 Mod 文件
              </h3>
              <div 
                class="drop-zone"
                :class="{ active: isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="handleDrop"
                @click="selectFiles"
              >
                <div class="drop-zone-icon">📥</div>
                <div class="drop-zone-title">
                  {{ isDragging ? '松开放入 Mod 文件' : '拖拽文件到此处' }}
                </div>
                <div class="drop-zone-text">或点击选择文件</div>
              </div>

              <!-- 待安装文件列表 -->
              <div v-if="pendingFiles.length > 0" class="pending-files mt-4">
                <div class="pending-header">
                  <h4>待安装文件 ({{ pendingFiles.length }})</h4>
                  <button class="btn btn-ghost btn-sm" @click="clearPendingFiles">清空</button>
                </div>
                <div class="file-list">
                  <div v-for="file in pendingFiles" :key="file.path" class="file-item">
                    <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <button class="btn btn-icon btn-ghost btn-sm" @click="removePendingFile(file)">
                      ×
                    </button>
                  </div>
                </div>
                <div class="pending-actions mt-4">
                  <button 
                    class="btn btn-success" 
                    :disabled="!selectedDirectory || pendingFiles.length === 0"
                    @click="installMods"
                  >
                    <span>✨</span> 安装 Mod
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 历史记录面板 -->
          <div v-show="activeTab === 'history'" class="tab-content">
            <div class="section">
              <div class="section-header">
                <h3 class="section-title">
                  <span>📜</span> 操作历史
                </h3>
                <button 
                  v-if="selectedGame.modHistory?.length > 0"
                  class="btn btn-warning btn-sm"
                  @click="restoreAllMods"
                >
                  <span>↩️</span> 一键还原全部
                </button>
              </div>

              <div v-if="!selectedGame.modHistory?.length" class="empty-state">
                <div class="empty-state-icon">📜</div>
                <p class="empty-state-text">暂无操作记录</p>
              </div>

              <div v-else class="history-list">
                <div 
                  v-for="history in [...selectedGame.modHistory].reverse()" 
                  :key="history.id"
                  class="history-item"
                >
                  <div class="history-icon">🎮</div>
                  <div class="history-content">
                    <div class="history-title">
                      Mod 安装 - {{ history.targetDirName }}
                    </div>
                    <div class="history-meta">
                      <span>📅 {{ formatDate(history.timestamp) }}</span>
                      <span>📁 {{ history.files.length }} 个文件</span>
                      <span class="badge badge-new">{{ history.files.filter(f => f.operationType === 'new').length }} 新增</span>
                      <span class="badge badge-replace">{{ history.files.filter(f => f.operationType === 'replace').length }} 替换</span>
                    </div>
                    <div class="history-files mt-2">
                      <span 
                        v-for="file in history.files.slice(0, 5)" 
                        :key="file.destPath"
                        class="file-tag"
                      >
                        {{ file.operationType === 'replace' ? '🔄' : '✨' }} {{ file.relativePath.split(/[\\/]/).pop() }}
                      </span>
                      <span v-if="history.files.length > 5" class="more-tag">
                        +{{ history.files.length - 5 }} 更多...
                      </span>
                    </div>
                  </div>
                  <div class="history-actions">
                    <button class="btn btn-warning btn-sm" @click="restoreMod(history.id)">
                      <span>↩️</span> 还原
                    </button>
                    <button class="btn btn-danger btn-sm" @click="deleteHistory(history.id)">
                      <span>🗑️</span> 删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 添加游戏弹窗 -->
    <div v-if="showAddGameModal" class="modal-overlay" @click.self="showAddGameModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">🎮 添加新游戏</h3>
          <button class="btn btn-icon btn-ghost" @click="showAddGameModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">游戏名称</label>
            <input 
              v-model="newGame.name" 
              type="text" 
              class="form-input" 
              placeholder="输入游戏名称，如：GTA V"
            >
          </div>
          <div class="form-group">
            <label class="form-label">游戏根目录</label>
            <div class="form-input-with-btn">
              <input 
                v-model="newGame.rootPath" 
                type="text" 
                class="form-input" 
                placeholder="选择游戏安装目录"
                readonly
              >
              <button class="btn btn-secondary" @click="selectGameRootPath">浏览...</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddGameModal = false">取消</button>
          <button class="btn btn-primary" @click="addGame" :disabled="!newGame.name || !newGame.rootPath">
            添加游戏
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑游戏弹窗 -->
    <div v-if="showEditGameModal" class="modal-overlay" @click.self="showEditGameModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">⚙️ 游戏设置</h3>
          <button class="btn btn-icon btn-ghost" @click="showEditGameModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">游戏名称</label>
            <input v-model="editGameData.name" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">游戏根目录</label>
            <div class="form-input-with-btn">
              <input v-model="editGameData.rootPath" type="text" class="form-input" readonly>
              <button class="btn btn-secondary" @click="selectEditRootPath">浏览...</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditGameModal = false">取消</button>
          <button class="btn btn-primary" @click="updateGame">保存更改</button>
        </div>
      </div>
    </div>

    <!-- 添加目录弹窗 -->
    <div v-if="showAddDirModal" class="modal-overlay" @click.self="showAddDirModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">📁 添加目标目录</h3>
          <button class="btn btn-icon btn-ghost" @click="showAddDirModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">目录名称</label>
            <input 
              v-model="newDirectory.name" 
              type="text" 
              class="form-input" 
              placeholder="如：Mods、Plugins、Mods文件夹"
            >
          </div>
          <div class="form-group">
            <label class="form-label">目录路径</label>
            <div class="form-input-with-btn">
              <input 
                v-model="newDirectory.path" 
                type="text" 
                class="form-input" 
                placeholder="Mod 文件要放入的目标目录"
                readonly
              >
              <button class="btn btn-secondary" @click="selectDirectoryPath">浏览...</button>
            </div>
            <p class="hint mt-2">相对于游戏根目录的完整路径</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddDirModal = false">取消</button>
          <button 
            class="btn btn-primary" 
            @click="addDirectory"
            :disabled="!newDirectory.name || !newDirectory.path"
          >
            添加目录
          </button>
        </div>
      </div>
    </div>

    <!-- 安装进度弹窗 -->
    <div v-if="showInstallModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">✨ 安装 Mod</h3>
        </div>
        <div class="modal-body">
          <div class="install-progress">
            <div class="progress-text">{{ installStatus }}</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: installProgress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'

export default {
  name: 'App',
  setup() {
    // 状态
    const games = ref([])
    const selectedGame = ref(null)
    const activeTab = ref('mod')
    const selectedDirectory = ref('')
    
    // 弹窗状态
    const showAddGameModal = ref(false)
    const showEditGameModal = ref(false)
    const showAddDirModal = ref(false)
    const showInstallModal = ref(false)
    
    // 拖拽状态
    const isDragging = ref(false)
    
    // 待安装文件
    const pendingFiles = ref([])
    
    // 安装状态
    const installStatus = ref('')
    const installProgress = ref(0)
    
    // 新游戏表单
    const newGame = reactive({
      name: '',
      rootPath: ''
    })
    
    // 编辑游戏数据
    const editGameData = reactive({
      name: '',
      rootPath: ''
    })
    
    // 新目录表单
    const newDirectory = reactive({
      name: '',
      path: ''
    })

    // 加载游戏列表
    const loadGames = async () => {
      try {
        const result = await window.electronAPI.getGames()
        games.value = result || []
      } catch (e) {
        console.error('加载游戏列表失败:', e)
        games.value = []
      }
    }

    // 选择游戏
    const selectGame = (game) => {
      selectedGame.value = game
      if (game.directories?.length > 0) {
        selectedDirectory.value = game.directories[0].path
      } else {
        selectedDirectory.value = ''
      }
    }

    // 窗口控制
    const minimizeWindow = () => window.electronAPI.minimize()
    const maximizeWindow = () => window.electronAPI.maximize()
    const closeWindow = () => window.electronAPI.close()

    // 选择游戏根目录
    const selectGameRootPath = async () => {
      const path = await window.electronAPI.selectFolder()
      if (path) {
        newGame.rootPath = path
      }
    }

    // 添加游戏
    const addGame = async () => {
      if (!newGame.name || !newGame.rootPath) return
      
      const game = {
        name: newGame.name,
        rootPath: newGame.rootPath,
        directories: []
      }
      
      const added = await window.electronAPI.addGame(game)
      games.value.push(added)
      
      // 重置表单
      newGame.name = ''
      newGame.rootPath = ''
      showAddGameModal.value = false
      
      // 选中新添加的游戏
      selectGame(added)
    }

    // 编辑游戏
    const selectEditRootPath = async () => {
      const path = await window.electronAPI.selectFolder()
      if (path) {
        editGameData.rootPath = path
      }
    }

    const updateGame = async () => {
      const index = games.value.findIndex(g => g.id === selectedGame.value.id)
      if (index !== -1) {
        games.value[index] = { 
          ...games.value[index], 
          name: editGameData.name,
          rootPath: editGameData.rootPath
        }
        await window.electronAPI.saveGames(games.value)
        selectedGame.value = games.value[index]
      }
      showEditGameModal.value = false
    }

    // 打开游戏目录
    const openGameFolder = () => {
      if (selectedGame.value?.rootPath) {
        window.electronAPI.openFolder(selectedGame.value.rootPath)
      }
    }

    // 删除游戏
    const confirmDeleteGame = async () => {
      if (confirm(`确定要删除游戏 "${selectedGame.value.name}" 吗？\n这将删除所有相关的备份文件。`)) {
        await window.electronAPI.deleteGame(selectedGame.value.id)
        games.value = games.value.filter(g => g.id !== selectedGame.value.id)
        selectedGame.value = null
      }
    }

    // 添加目录
    const selectDirectoryPath = async () => {
      const path = await window.electronAPI.selectFolder()
      if (path) {
        newDirectory.path = path
      }
    }

    const addDirectory = async () => {
      if (!newDirectory.name || !newDirectory.path) return
      
      const index = games.value.findIndex(g => g.id === selectedGame.value.id)
      if (index !== -1) {
        games.value[index].directories = games.value[index].directories || []
        games.value[index].directories.push({
          name: newDirectory.name,
          path: newDirectory.path
        })
        await window.electronAPI.saveGames(games.value)
        selectedGame.value = games.value[index]
        selectedDirectory.value = newDirectory.path
      }
      
      // 重置表单
      newDirectory.name = ''
      newDirectory.path = ''
      showAddDirModal.value = false
    }

    // 文件拖放处理
    const handleDrop = async (e) => {
      isDragging.value = false
      const files = e.dataTransfer.files
      await processFiles(files)
    }

    // 选择文件
    const selectFiles = async () => {
      const files = await window.electronAPI.selectFiles()
      if (files?.length > 0) {
        for (const filePath of files) {
          const info = await window.electronAPI.getFileInfo(filePath)
          if (!info.isDirectory && !pendingFiles.value.some(f => f.path === filePath)) {
            pendingFiles.value.push({
              path: filePath,
              name: filePath.split(/[\\/]/).pop(),
              size: info.size
            })
          }
        }
      }
    }

    // 处理文件
    const processFiles = async (fileList) => {
      for (const file of fileList) {
        const filePath = file.path
        const info = await window.electronAPI.getFileInfo(filePath)
        if (!info.isDirectory && !pendingFiles.value.some(f => f.path === filePath)) {
          pendingFiles.value.push({
            path: filePath,
            name: file.name,
            size: file.size
          })
        }
      }
    }

    // 清空待安装文件
    const clearPendingFiles = () => {
      pendingFiles.value = []
    }

    // 移除单个文件
    const removePendingFile = (file) => {
      pendingFiles.value = pendingFiles.value.filter(f => f.path !== file.path)
    }

    // 安装 Mod
    const installMods = async () => {
      if (!selectedDirectory.value || pendingFiles.value.length === 0) return
      
      showInstallModal.value = true
      installProgress.value = 0
      installStatus.value = '正在准备安装...'
      
      const dirName = selectedGame.value.directories.find(d => d.path === selectedDirectory.value)?.name || '未知目录'
      
      try {
        installStatus.value = '正在复制文件...'
        installProgress.value = 30
        
        const result = await window.electronAPI.installMod({
          gameId: selectedGame.value.id,
          sourceFiles: pendingFiles.value.map(f => f.path),
          targetDir: selectedDirectory.value,
          targetDirName: dirName
        })
        
        installProgress.value = 100
        installStatus.value = '安装完成！'
        
        // 更新游戏数据
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
        
        // 清空待安装文件
        pendingFiles.value = []
        
        // 切换到历史记录
        activeTab.value = 'history'
        
        setTimeout(() => {
          showInstallModal.value = false
        }, 1000)
        
      } catch (e) {
        installStatus.value = '安装失败: ' + e.message
        setTimeout(() => {
          showInstallModal.value = false
        }, 2000)
      }
    }

    // 还原 Mod
    const restoreMod = async (historyId) => {
      if (confirm('确定要还原这个 Mod 吗？\n这将恢复被替换的文件并删除新增的文件。')) {
        await window.electronAPI.restoreMod({
          gameId: selectedGame.value.id,
          historyId: historyId
        })
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
      }
    }

    // 一键还原所有
    const restoreAllMods = async () => {
      if (confirm('确定要还原所有 Mod 吗？\n这将恢复游戏到安装 Mod 之前的状态。')) {
        await window.electronAPI.restoreAllMods({
          gameId: selectedGame.value.id
        })
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
      }
    }

    // 删除历史记录
    const deleteHistory = async (historyId) => {
      if (confirm('确定要删除这条历史记录吗？\n注意：这不会还原已安装的 Mod。')) {
        await window.electronAPI.deleteModHistory({
          gameId: selectedGame.value.id,
          historyId: historyId
        })
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
      }
    }

    // 工具函数
    const getGameIcon = (name) => {
      const icons = ['🎮', '🎯', '🎲', '🎰', '🕹️', '🖥️', '👾', '🏆']
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return icons[Math.abs(hash) % icons.length]
    }

    const getFileIcon = (name) => {
      const ext = name.split('.').pop()?.toLowerCase()
      const iconMap = {
        'dll': '📦',
        'exe': '⚙️',
        'zip': '🗜️',
        'rar': '🗜️',
        '7z': '🗜️',
        'pak': '📦',
        'asi': '📜',
        'lua': '📜',
        'txt': '📄',
        'json': '📋',
        'xml': '📋',
        'ini': '⚙️',
        'cfg': '⚙️'
      }
      return iconMap[ext] || '📄'
    }

    const truncatePath = (path, maxLen = 30) => {
      if (!path) return ''
      if (path.length <= maxLen) return path
      return '...' + path.slice(-maxLen)
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (isoString) => {
      const date = new Date(isoString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 监听编辑弹窗打开
    watch(showEditGameModal, (val) => {
      if (val && selectedGame.value) {
        editGameData.name = selectedGame.value.name
        editGameData.rootPath = selectedGame.value.rootPath
      }
    })

    // 初始化
    onMounted(() => {
      loadGames()
    })

    return {
      games,
      selectedGame,
      activeTab,
      selectedDirectory,
      showAddGameModal,
      showEditGameModal,
      showAddDirModal,
      showInstallModal,
      isDragging,
      pendingFiles,
      installStatus,
      installProgress,
      newGame,
      editGameData,
      newDirectory,
      
      minimizeWindow,
      maximizeWindow,
      closeWindow,
      selectGame,
      selectGameRootPath,
      addGame,
      selectEditRootPath,
      updateGame,
      openGameFolder,
      confirmDeleteGame,
      selectDirectoryPath,
      addDirectory,
      handleDrop,
      selectFiles,
      clearPendingFiles,
      removePendingFile,
      installMods,
      restoreMod,
      restoreAllMods,
      deleteHistory,
      
      getGameIcon,
      getFileIcon,
      truncatePath,
      formatFileSize,
      formatDate
    }
  }
}
</script>

<style scoped>
/* ===== App Container ===== */
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

/* ===== Title Bar ===== */
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.95) 100%);
  border-bottom: 1px solid var(--border-color);
  -webkit-app-region: drag;
  flex-shrink: 0;
}

.title-bar-drag {
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 16px;
}

.title-bar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 20px;
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-bar-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.title-bar-btn {
  width: 46px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.title-bar-btn svg {
  width: 12px;
  height: 12px;
}

.title-bar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.title-bar-btn.close:hover {
  background: var(--accent-primary);
  color: white;
}

/* ===== Main Content ===== */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== Sidebar ===== */
.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.game-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.game-card {
  padding: 16px;
  margin-bottom: 12px;
}

.game-card.selected {
  border-color: var(--accent-primary);
}

.game-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.game-info {
  min-width: 0;
}

.game-name {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-path {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-meta {
  display: flex;
  gap: 6px;
}

/* ===== Panel ===== */
.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Welcome Screen ===== */
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: bounce 2s ease-in-out infinite;
}

.welcome-content h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-content p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 32px;
}

.welcome-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.feature-icon {
  font-size: 24px;
}

.feature span:last-child {
  font-weight: 600;
  color: var(--text-secondary);
}

/* ===== Game Detail ===== */
.game-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.game-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.game-header-icon {
  font-size: 48px;
}

.game-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.game-path-full {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 4px 0 0 0;
}

.game-header-actions {
  display: flex;
  gap: 8px;
}

/* ===== Tabs ===== */
.tabs {
  display: flex;
  gap: 4px;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-family: var(--font-family);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.tab.active {
  background: var(--accent-primary);
  color: white;
}

/* ===== Tab Content ===== */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header .section-title {
  margin-bottom: 0;
}

/* ===== Directory List ===== */
.directory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.directory-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.directory-item:hover {
  border-color: rgba(233, 69, 96, 0.5);
  background: var(--bg-card-hover);
}

.directory-item.selected {
  border-color: var(--accent-primary);
  background: rgba(233, 69, 96, 0.1);
}

.dir-icon {
  font-size: 24px;
}

.dir-info {
  flex: 1;
  min-width: 0;
}

.dir-name {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}

.dir-path {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-icon {
  color: var(--accent-primary);
  font-size: 1.2rem;
  font-weight: bold;
}

/* ===== Drop Zone ===== */
.drop-zone {
  padding: 48px 32px;
}

.drop-zone.active {
  background: rgba(233, 69, 96, 0.1);
  border-color: var(--accent-primary);
}

.drop-zone-icon {
  transition: transform var(--transition-normal);
}

.drop-zone:hover .drop-zone-icon,
.drop-zone.active .drop-zone-icon {
  transform: scale(1.2);
}

/* ===== Pending Files ===== */
.pending-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.pending-header h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.file-icon {
  font-size: 20px;
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pending-actions {
  display: flex;
  justify-content: flex-end;
}

/* ===== History List ===== */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.file-tag {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  color: var(--text-secondary);
}

.more-tag {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: rgba(233, 69, 96, 0.2);
  border-radius: 4px;
  color: var(--accent-primary);
}

/* ===== Install Progress ===== */
.install-progress {
  text-align: center;
}

.progress-text {
  margin-bottom: 16px;
  font-size: 1rem;
  color: var(--text-secondary);
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary));
  border-radius: 4px;
  transition: width var(--transition-normal);
}

/* ===== Hint ===== */
.hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* ===== Animations ===== */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>