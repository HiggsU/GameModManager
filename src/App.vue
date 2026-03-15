<template>
  <div class="app-container" :class="{ 'light-mode': isLightMode }">
    <!-- 自定义标题栏 -->
    <div class="title-bar">
      <div class="title-bar-drag">
        <div class="title-bar-logo">
          <div class="logo-pixel">🎮</div>
          <div class="logo-text">
            <span class="logo-main">Game Mod Manager</span>
            <span class="logo-sub">轻松管理你的游戏Mod</span>
          </div>
        </div>
      </div>
      <div class="title-bar-controls">
        <button class="title-btn theme-toggle" @click="toggleTheme" :title="isLightMode ? '切换到深色模式' : '切换到浅色模式'">
          <svg v-if="isLightMode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>
        <button class="title-btn minimize" @click="minimizeWindow" title="最小化">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/>
          </svg>
        </button>
        <button class="title-btn maximize" @click="maximizeWindow" title="最大化">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
          </svg>
        </button>
        <button class="title-btn close" @click="closeWindow" title="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l12 12M6 18L18 6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>
            <span class="sidebar-icon">🎯</span>
            游戏列表
          </h3>
          <button class="btn-add-game" @click="openAddGameModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
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
            <div class="game-card-icon">{{ getGameIcon(game.name) }}</div>
            <div class="game-card-info">
              <h4 class="game-card-name">{{ game.name }}</h4>
              <div class="game-card-stats">
                <span class="stat-item">
                  <span class="stat-icon">📦</span>
                  {{ game.mods?.length || 0 }} Mod
                </span>
              </div>
            </div>
            <div class="game-card-indicator"></div>
          </div>
          
          <div v-if="games.length === 0" class="empty-games">
            <div class="empty-icon">🎮</div>
            <p>还没有游戏</p>
            <button class="btn btn-primary btn-sm" @click="openAddGameModal">
              添加第一个游戏
            </button>
          </div>
        </div>
      </aside>

      <!-- 主面板 -->
      <main class="panel">
        <!-- 欢迎界面 -->
        <div v-if="!selectedGame" class="welcome-screen">
          <div class="welcome-content animate-slideUp">
            <div class="welcome-hero">
              <div class="welcome-icon">
                <span class="icon-main">🎮</span>
                <span class="icon-float">✨</span>
              </div>
              <h1>Game Mod Manager</h1>
              <p class="welcome-tagline">简化游戏打 Mod 的操作，支持一键还原</p>
            </div>
            
            <div class="welcome-features">
              <div class="feature-card">
                <div class="feature-icon">📁</div>
                <div class="feature-text">
                  <h4>多游戏支持</h4>
                  <p>管理多个游戏的 Mod</p>
                </div>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🎯</div>
                <div class="feature-text">
                  <h4>拖拽安装</h4>
                  <p>支持文件和文件夹</p>
                </div>
              </div>
              <div class="feature-card">
                <div class="feature-icon">💾</div>
                <div class="feature-text">
                  <h4>自动备份</h4>
                  <p>安全可靠</p>
                </div>
              </div>
              <div class="feature-card">
                <div class="feature-icon">↩️</div>
                <div class="feature-text">
                  <h4>一键还原</h4>
                  <p>随时恢复</p>
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-lg" @click="openAddGameModal">
              <span>🚀</span> 开始使用
            </button>
          </div>
        </div>

        <!-- 游戏详情 -->
        <div v-else class="game-detail animate-fadeIn">
          <!-- 游戏头部 -->
          <div class="game-header">
            <div class="game-header-left">
              <div class="game-avatar">{{ getGameIcon(selectedGame.name) }}</div>
              <div class="game-header-info">
                <h2>{{ selectedGame.name }}</h2>
                <p class="game-path" @click="openFolder(selectedGame.rootPath)">
                  📂 {{ selectedGame.rootPath }}
                </p>
              </div>
            </div>
            <div class="game-header-actions">
              <button class="btn btn-ghost btn-sm" @click="openFolder(selectedGame.rootPath)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                打开目录
              </button>
              <button class="btn btn-ghost btn-sm" @click="showSettings = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                设置
              </button>
              <button class="btn btn-danger btn-sm" @click="confirmDeleteGame">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 目标目录选择 -->
          <div class="target-section">
            <div class="target-header">
              <h3>
                <span class="section-icon">📁</span>
                目标目录
              </h3>
              <button class="btn btn-secondary btn-sm" @click="showAddDirModal = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                添加目录
              </button>
            </div>
            
            <div class="target-list">
              <!-- 默认游戏根目录 -->
              <div 
                class="target-item"
                :class="{ selected: targetDirectory === selectedGame.rootPath }"
                @click="targetDirectory = selectedGame.rootPath"
              >
                <div class="target-icon">🏠</div>
                <div class="target-info">
                  <span class="target-name">游戏根目录</span>
                  <span class="target-path">{{ selectedGame.rootPath }}</span>
                </div>
                <div v-if="targetDirectory === selectedGame.rootPath" class="target-check">✓</div>
              </div>
              
              <!-- 自定义目录 -->
              <div 
                v-for="dir in selectedGame.directories" 
                :key="dir.path"
                class="target-item"
                :class="{ selected: targetDirectory === dir.path }"
                @click="targetDirectory = dir.path"
              >
                <div class="target-icon">📂</div>
                <div class="target-info">
                  <span class="target-name">{{ dir.name }}</span>
                  <span class="target-path">{{ dir.path }}</span>
                </div>
                <div v-if="targetDirectory === dir.path" class="target-check">✓</div>
                <button class="target-remove" @click.stop="removeDirectory(dir.path)">×</button>
              </div>
            </div>
          </div>

          <!-- 拖拽区域 -->
          <div 
            class="drop-zone"
            :class="{ active: isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="selectFiles"
          >
            <div class="drop-content">
              <div class="drop-icon">
                <span v-if="!isDragging">📥</span>
                <span v-else class="bounce">🎯</span>
              </div>
              <div class="drop-text">
                <h3>{{ isDragging ? '松开添加 Mod' : '拖拽 Mod 文件到这里' }}</h3>
                <p>支持文件、文件夹或混合拖拽</p>
              </div>
              <button class="btn btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                或点击选择
              </button>
            </div>
          </div>

          <!-- Mod 列表 -->
          <div class="mod-section">
            <div class="mod-header">
              <h3>
                <span class="section-icon">📦</span>
                已安装 Mod
                <span class="mod-count">{{ selectedGame.mods?.length || 0 }}</span>
              </h3>
              <button 
                v-if="selectedGame.mods?.length > 0"
                class="btn btn-warning btn-sm"
                @click="restoreAllMods"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                一键还原全部
              </button>
            </div>

            <div v-if="!selectedGame.mods?.length" class="empty-mods">
              <div class="empty-icon">📦</div>
              <p>还没有安装任何 Mod</p>
              <span>拖拽文件到上方区域开始安装</span>
            </div>

            <div v-else class="mod-list">
              <div 
                v-for="mod in [...selectedGame.mods].reverse()" 
                :key="mod.id"
                class="mod-card"
              >
                <div class="mod-icon">{{ getModIcon(mod.name) }}</div>
                <div class="mod-info">
                  <div class="mod-title">
                    <h4>{{ mod.name }}</h4>
                    <span class="mod-date">{{ formatDate(mod.createdAt) }}</span>
                  </div>
                  <p v-if="mod.description" class="mod-desc">{{ mod.description }}</p>
                  <div class="mod-stats">
                    <span class="stat">
                      <span class="stat-dot new"></span>
                      {{ mod.stats?.new || 0 }} 新增
                    </span>
                    <span class="stat">
                      <span class="stat-dot replace"></span>
                      {{ mod.stats?.replaced || 0 }} 替换
                    </span>
                    <span class="stat-total">共 {{ mod.stats?.total || 0 }} 文件</span>
                  </div>
                </div>
                <div class="mod-actions">
                  <button class="btn btn-ghost btn-sm" @click="showModFiles(mod)" title="查看文件">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </button>
                  <button class="btn btn-warning btn-sm" @click="restoreMod(mod.id)" title="还原">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    还原
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 添加游戏弹窗 -->
    <div v-if="showAddGameModal" class="modal-overlay" @click.self="closeAddGameModal">
      <div class="modal animate-scaleIn">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">🎮</span>
            添加新游戏
          </h3>
          <button class="btn-close" @click="closeAddGameModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">游戏名称</label>
            <input 
              v-model="newGame.name" 
              type="text" 
              class="form-input" 
              placeholder="例如：GTA V、Minecraft、Cyberpunk 2077"
              @keyup.enter="addGame"
            >
          </div>
          <div class="form-group">
            <label class="form-label">游戏根目录</label>
            <div class="input-group">
              <input 
                v-model="newGame.rootPath" 
                type="text" 
                class="form-input" 
                placeholder="游戏安装目录"
                readonly
              >
              <button class="btn btn-secondary" @click="selectGameRootPath">浏览</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAddGameModal">取消</button>
          <button 
            class="btn btn-primary" 
            @click="addGame"
            :disabled="!newGame.name || !newGame.rootPath"
          >
            <span>✨</span> 添加游戏
          </button>
        </div>
      </div>
    </div>

    <!-- 添加目录弹窗 -->
    <div v-if="showAddDirModal" class="modal-overlay" @click.self="showAddDirModal = false">
      <div class="modal animate-scaleIn">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">📁</span>
            添加目标目录
          </h3>
          <button class="btn-close" @click="showAddDirModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">目录名称</label>
            <input 
              v-model="newDir.name" 
              type="text" 
              class="form-input" 
              placeholder="例如：Mods、Plugins、Data"
            >
          </div>
          <div class="form-group">
            <label class="form-label">目录路径</label>
            <div class="input-group">
              <input 
                v-model="newDir.path" 
                type="text" 
                class="form-input" 
                placeholder="Mod 文件要放入的目标目录"
                readonly
              >
              <button class="btn btn-secondary" @click="selectDirPath">浏览</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddDirModal = false">取消</button>
          <button 
            class="btn btn-primary" 
            @click="addDirectory"
            :disabled="!newDir.name || !newDir.path"
          >
            <span>📁</span> 添加目录
          </button>
        </div>
      </div>
    </div>

    <!-- 安装 Mod 弹窗 -->
    <div v-if="showInstallModal" class="modal-overlay">
      <div class="modal animate-scaleIn">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">✨</span>
            安装 Mod
          </h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Mod 名称</label>
            <input 
              v-model="installModName" 
              type="text" 
              class="form-input" 
              placeholder="给这个 Mod 起个名字"
            >
          </div>
          <div class="form-group">
            <label class="form-label">描述（可选）</label>
            <input 
              v-model="installModDesc" 
              type="text" 
              class="form-input" 
              placeholder="简要描述这个 Mod"
            >
          </div>
          <div class="install-files">
            <div class="files-header">
              <span>待安装文件 ({{ pendingFiles.length }})</span>
              <button class="btn btn-ghost btn-sm" @click="clearPendingFiles">清空</button>
            </div>
            <div class="files-list">
              <div v-for="file in pendingFiles.slice(0, 5)" :key="file.path" class="file-item">
                <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </div>
              <div v-if="pendingFiles.length > 5" class="file-more">
                还有 {{ pendingFiles.length - 5 }} 个文件...
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelInstall">取消</button>
          <button 
            class="btn btn-success" 
            @click="confirmInstall"
            :disabled="pendingFiles.length === 0"
          >
            <span>🚀</span> 安装
          </button>
        </div>
      </div>
    </div>

    <!-- Mod 文件详情弹窗 -->
    <div v-if="showFilesModal" class="modal-overlay" @click.self="showFilesModal = false">
      <div class="modal modal-lg animate-scaleIn">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">📄</span>
            {{ selectedMod?.name }} - 文件列表
          </h3>
          <button class="btn-close" @click="showFilesModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="file-detail-list">
            <div v-for="file in selectedMod?.files" :key="file.destPath" class="file-detail-item">
              <span class="file-type" :class="file.operationType">
                {{ file.operationType === 'replace' ? '🔄' : '✨' }}
              </span>
              <span class="file-path">{{ file.relativePath }}</span>
              <span class="file-size">{{ formatSize(file.size) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="modal animate-scaleIn">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">⚙️</span>
            游戏设置
          </h3>
          <button class="btn-close" @click="showSettings = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">游戏名称</label>
            <input v-model="editGameName" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">游戏根目录</label>
            <div class="input-group">
              <input v-model="editGamePath" type="text" class="form-input" readonly>
              <button class="btn btn-secondary" @click="selectEditPath">浏览</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showSettings = false">取消</button>
          <button class="btn btn-primary" @click="updateGame">保存</button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'

export default {
  name: 'App',
  setup() {
    // 主题模式
    const isLightMode = ref(true) // 默认浅色模式
    
    // 状态
    const games = ref([])
    const selectedGame = ref(null)
    const targetDirectory = ref('')
    
    // 弹窗状态
    const showAddGameModal = ref(false)
    const showAddDirModal = ref(false)
    const showInstallModal = ref(false)
    const showFilesModal = ref(false)
    const showSettings = ref(false)
    
    // 拖拽
    const isDragging = ref(false)
    
    // 待安装文件
    const pendingFiles = ref([])
    const installModName = ref('')
    const installModDesc = ref('')
    
    // 选中的 Mod
    const selectedMod = ref(null)
    
    // 编辑
    const editGameName = ref('')
    const editGamePath = ref('')
    
    // Toast
    const toast = reactive({
      show: false,
      message: '',
      type: 'success'
    })

    // 表单
    const newGame = reactive({ name: '', rootPath: '' })
    const newDir = reactive({ name: '', path: '' })

    // 工具函数
    const showToast = (message, type = 'success') => {
      toast.message = message
      toast.type = type
      toast.show = true
      setTimeout(() => toast.show = false, 3000)
    }

    const getGameIcon = (name) => {
      const icons = ['🎮', '🎯', '🎲', '🎰', '🕹️', '🖥️', '👾', '🏆', '🎪', '🎨']
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return icons[Math.abs(hash) % icons.length]
    }

    const getModIcon = (name) => {
      const icons = ['📦', '🎁', '🧩', '🔧', '⚡', '🔥', '💎', '🌟']
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return icons[Math.abs(hash) % icons.length]
    }

    const getFileIcon = (name) => {
      const ext = name.split('.').pop()?.toLowerCase()
      const map = { dll: '📦', exe: '⚙️', zip: '🗜️', rar: '🗜️', pak: '📦', asi: '📜', lua: '📜' }
      return map[ext] || '📄'
    }

    const formatSize = (bytes) => {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const formatDate = (str) => {
      if (!str) return ''
      const d = new Date(str)
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    // 窗口控制
    const minimizeWindow = () => window.electronAPI.minimize()
    const maximizeWindow = () => window.electronAPI.maximize()
    const closeWindow = () => window.electronAPI.close()
    
    // 主题切换
    const toggleTheme = () => {
      isLightMode.value = !isLightMode.value
    }

    // 加载游戏
    const loadGames = async () => {
      try {
        games.value = await window.electronAPI.getGames() || []
      } catch (e) {
        console.error(e)
      }
    }

    // 选择游戏
    const selectGame = (game) => {
      selectedGame.value = game
      targetDirectory.value = game.rootPath
    }

    // 打开文件夹
    const openFolder = (path) => {
      window.electronAPI.openFolder(path)
    }

    // 添加游戏
    const openAddGameModal = () => {
      newGame.name = ''
      newGame.rootPath = ''
      showAddGameModal.value = true
    }

    const closeAddGameModal = () => {
      showAddGameModal.value = false
    }

    const selectGameRootPath = async () => {
      const path = await window.electronAPI.selectFolder()
      if (path) newGame.rootPath = path
    }

    const addGame = async () => {
      if (!newGame.name || !newGame.rootPath) return
      
      const game = await window.electronAPI.addGame({
        name: newGame.name,
        rootPath: newGame.rootPath
      })
      
      games.value.push(game)
      selectGame(game)
      closeAddGameModal()
      showToast(`游戏 "${game.name}" 添加成功！`)
    }

    // 删除游戏
    const confirmDeleteGame = async () => {
      if (!confirm(`确定要删除 "${selectedGame.value.name}"？\n这将删除所有 Mod 备份。`)) return
      
      await window.electronAPI.deleteGame(selectedGame.value.id)
      games.value = games.value.filter(g => g.id !== selectedGame.value.id)
      selectedGame.value = null
      showToast('游戏已删除')
    }

    // 设置
    const selectEditPath = async () => {
      const path = await window.electronAPI.selectFolder()
      if (path) editGamePath.value = path
    }

    const updateGame = async () => {
      const idx = games.value.findIndex(g => g.id === selectedGame.value.id)
      if (idx === -1) return
      
      games.value[idx].name = editGameName.value
      games.value[idx].rootPath = editGamePath.value
      
      await window.electronAPI.saveGames(games.value)
      selectedGame.value = games.value[idx]
      targetDirectory.value = editGamePath.value
      showSettings.value = false
      showToast('设置已保存')
    }

    // 添加目录
    const selectDirPath = async () => {
      const path = await window.electronAPI.selectFolder()
      if (path) newDir.path = path
    }

    const addDirectory = async () => {
      if (!newDir.name || !newDir.path) return
      
      const idx = games.value.findIndex(g => g.id === selectedGame.value.id)
      if (idx === -1) return
      
      games.value[idx].directories = games.value[idx].directories || []
      games.value[idx].directories.push({ name: newDir.name, path: newDir.path })
      
      await window.electronAPI.saveGames(games.value)
      selectedGame.value = games.value[idx]
      targetDirectory.value = newDir.path
      
      newDir.name = ''
      newDir.path = ''
      showAddDirModal.value = false
      showToast('目录已添加')
    }

    const removeDirectory = async (path) => {
      const idx = games.value.findIndex(g => g.id === selectedGame.value.id)
      if (idx === -1) return
      
      games.value[idx].directories = games.value[idx].directories.filter(d => d.path !== path)
      await window.electronAPI.saveGames(games.value)
      selectedGame.value = games.value[idx]
      
      if (targetDirectory.value === path) {
        targetDirectory.value = selectedGame.value.rootPath
      }
    }

    // 拖拽处理
    const handleDrop = async (e) => {
      isDragging.value = false
      
      const items = e.dataTransfer.files
      pendingFiles.value = []
      
      for (const item of items) {
        const info = await window.electronAPI.getFileInfo(item.path)
        if (info.exists) {
          if (info.isDirectory) {
            // 递归获取文件夹内容
            const contents = await getDirectoryContents(item.path)
            pendingFiles.value.push(...contents)
          } else {
            pendingFiles.value.push({
              path: item.path,
              name: item.name,
              size: info.size
            })
          }
        }
      }
      
      if (pendingFiles.value.length > 0) {
        installModName.value = `Mod ${(selectedGame.value.mods?.length || 0) + 1}`
        installModDesc.value = ''
        showInstallModal.value = true
      }
    }

    const getDirectoryContents = async (dirPath) => {
      const results = []
      const scanDir = async (currentPath, basePath) => {
        const items = await window.electronAPI.listDirectory(currentPath)
        if (!items.success) return
        
        for (const item of items.files) {
          if (item.isDirectory) {
            await scanDir(item.path, basePath)
          } else {
            results.push({
              path: item.path,
              name: item.name,
              size: item.size,
              relativePath: item.path.replace(basePath, '').replace(/^[\\\/]/, '')
            })
          }
        }
      }
      
      await scanDir(dirPath, dirPath)
      return results
    }

    // 选择文件
    const selectFiles = async () => {
      const paths = await window.electronAPI.selectFiles()
      if (!paths?.length) return
      
      pendingFiles.value = []
      
      for (const p of paths) {
        const info = await window.electronAPI.getFileInfo(p)
        if (info.exists) {
          if (info.isDirectory) {
            const contents = await getDirectoryContents(p)
            pendingFiles.value.push(...contents)
          } else {
            pendingFiles.value.push({
              path: p,
              name: p.split(/[\\/]/).pop(),
              size: info.size
            })
          }
        }
      }
      
      if (pendingFiles.value.length > 0) {
        installModName.value = `Mod ${(selectedGame.value.mods?.length || 0) + 1}`
        installModDesc.value = ''
        showInstallModal.value = true
      }
    }

    const clearPendingFiles = () => {
      pendingFiles.value = []
    }

    const cancelInstall = () => {
      showInstallModal.value = false
      pendingFiles.value = []
    }

    const confirmInstall = async () => {
      if (pendingFiles.value.length === 0) return
      
      showInstallModal.value = false
      
      const result = await window.electronAPI.installMod({
        gameId: selectedGame.value.id,
        modName: installModName.value,
        modDescription: installModDesc.value,
        sourceItems: [...new Set(pendingFiles.value.map(f => f.path))],
        targetDir: targetDirectory.value
      })
      
      if (result.success) {
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
        showToast(`Mod "${installModName.value}" 安装成功！`)
        pendingFiles.value = []
      } else {
        showToast('安装失败: ' + result.error, 'error')
      }
    }

    // Mod 操作
    const showModFiles = (mod) => {
      selectedMod.value = mod
      showFilesModal.value = true
    }

    const restoreMod = async (modId) => {
      if (!confirm('确定要还原这个 Mod 吗？\n这将恢复被替换的文件并删除新增的文件。')) return
      
      const result = await window.electronAPI.restoreMod({
        gameId: selectedGame.value.id,
        modId: modId
      })
      
      if (result.success) {
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
        showToast('Mod 已还原')
      } else {
        showToast('还原失败: ' + result.error, 'error')
      }
    }

    const restoreAllMods = async () => {
      if (!confirm('确定要还原所有 Mod 吗？\n这将恢复游戏到安装 Mod 之前的状态。')) return
      
      const result = await window.electronAPI.restoreAllMods({
        gameId: selectedGame.value.id
      })
      
      if (result.success) {
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
        showToast('所有 Mod 已还原')
      }
    }

    // 监听设置弹窗
    watch(showSettings, (val) => {
      if (val && selectedGame.value) {
        editGameName.value = selectedGame.value.name
        editGamePath.value = selectedGame.value.rootPath
      }
    })

    onMounted(loadGames)

    return {
      isLightMode,
      games, selectedGame, targetDirectory,
      showAddGameModal, showAddDirModal, showInstallModal, showFilesModal, showSettings,
      isDragging, pendingFiles, installModName, installModDesc,
      selectedMod, editGameName, editGamePath, toast,
      newGame, newDir,
      
      showToast, getGameIcon, getModIcon, getFileIcon, formatSize, formatDate,
      minimizeWindow, maximizeWindow, closeWindow, toggleTheme,
      loadGames, selectGame, openFolder,
      openAddGameModal, closeAddGameModal, selectGameRootPath, addGame,
      confirmDeleteGame, selectEditPath, updateGame,
      selectDirPath, addDirectory, removeDirectory,
      handleDrop, selectFiles, clearPendingFiles, cancelInstall, confirmInstall,
      showModFiles, restoreMod, restoreAllMods
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
}

/* ===== Title Bar ===== */
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  -webkit-app-region: drag;
  flex-shrink: 0;
  padding: 0 8px;
}

.title-bar-drag {
  flex: 1;
  display: flex;
  align-items: center;
}

.title-bar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 12px;
}

.logo-pixel {
  font-size: 28px;
  filter: drop-shadow(0 2px 8px rgba(233, 69, 96, 0.4));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-main {
  font-size: 16px;
  font-weight: 800;
  background: linear-gradient(135deg, #e94560, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.logo-sub {
  font-size: 11px;
  color: #718096;
  margin-top: -2px;
}

.title-bar-controls {
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.title-btn {
  width: 40px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #718096;
}

.title-btn svg {
  width: 16px;
  height: 16px;
}

.title-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.title-btn.close:hover {
  background: #e94560;
  color: #fff;
}

.title-btn.theme-toggle {
  color: #feca57;
}

.title-btn.theme-toggle:hover {
  background: rgba(254, 202, 87, 0.2);
  color: #feca57;
}

.light-mode .title-btn.theme-toggle {
  color: #f59e0b;
}

.light-mode .title-btn.theme-toggle:hover {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

/* ===== Main Content ===== */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== Sidebar ===== */
.sidebar {
  width: 260px;
  background: rgba(22, 33, 62, 0.5);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 12px;
}

.sidebar-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-icon {
  font-size: 16px;
}

.btn-add-game {
  width: 32px;
  height: 32px;
  border: none;
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.btn-add-game:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(233, 69, 96, 0.4);
}

.btn-add-game svg {
  width: 18px;
  height: 18px;
}

.game-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 12px;
}

.game-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-bottom: 8px;
  background: rgba(31, 41, 55, 0.5);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
}

.game-card:hover {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(233, 69, 96, 0.3);
}

.game-card.selected {
  background: rgba(233, 69, 96, 0.15);
  border-color: #e94560;
}

.game-card-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.game-card.selected .game-card-indicator {
  opacity: 1;
}

.game-card-icon {
  font-size: 32px;
  line-height: 1;
}

.game-card-info {
  flex: 1;
  min-width: 0;
}

.game-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-card-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #718096;
}

.stat-icon {
  font-size: 12px;
}

.empty-games {
  text-align: center;
  padding: 40px 16px;
}

.empty-games .empty-icon {
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: 12px;
}

.empty-games p {
  color: #718096;
  margin-bottom: 16px;
}

/* ===== Panel ===== */
.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.3) 0%, rgba(26, 26, 46, 0.8) 100%);
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
  max-width: 600px;
}

.welcome-hero {
  margin-bottom: 48px;
}

.welcome-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.icon-main {
  font-size: 80px;
  filter: drop-shadow(0 8px 24px rgba(233, 69, 96, 0.4));
}

.icon-float {
  position: absolute;
  top: -10px;
  right: -20px;
  font-size: 32px;
  animation: float 2s ease-in-out infinite;
}

.welcome-hero h1 {
  font-size: 36px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #e94560, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-tagline {
  font-size: 16px;
  color: #718096;
}

.welcome-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.3s;
}

.feature-card:hover {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(233, 69, 96, 0.3);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 32px;
}

.feature-text h4 {
  font-size: 14px;
  margin: 0 0 2px;
  color: #fff;
}

.feature-text p {
  font-size: 12px;
  color: #718096;
  margin: 0;
}

/* ===== Game Detail ===== */
.game-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.game-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.game-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 8px 24px rgba(233, 69, 96, 0.3);
}

.game-header-info h2 {
  margin: 0 0 4px;
  font-size: 24px;
}

.game-path {
  font-size: 13px;
  color: #718096;
  cursor: pointer;
  margin: 0;
  transition: color 0.2s;
}

.game-path:hover {
  color: #e94560;
}

.game-header-actions {
  display: flex;
  gap: 8px;
}

/* ===== Target Section ===== */
.target-section {
  margin-bottom: 24px;
}

.target-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.target-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.section-icon {
  font-size: 18px;
}

.target-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.target-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(31, 41, 55, 0.5);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.target-item:hover {
  background: rgba(31, 41, 55, 0.8);
}

.target-item.selected {
  border-color: #e94560;
  background: rgba(233, 69, 96, 0.1);
}

.target-icon {
  font-size: 20px;
}

.target-info {
  display: flex;
  flex-direction: column;
}

.target-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.target-path {
  font-size: 11px;
  color: #718096;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.target-check {
  color: #10b981;
  font-weight: bold;
}

.target-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border: none;
  background: #ef4444;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.target-item:hover .target-remove {
  opacity: 1;
}

/* ===== Drop Zone ===== */
.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
  background: rgba(31, 41, 55, 0.3);
}

.drop-zone:hover {
  border-color: rgba(233, 69, 96, 0.5);
  background: rgba(233, 69, 96, 0.05);
}

.drop-zone.active {
  border-color: #e94560;
  background: rgba(233, 69, 96, 0.1);
  border-style: solid;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.drop-icon {
  font-size: 48px;
}

.drop-icon .bounce {
  animation: bounce 0.6s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.drop-text h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #fff;
}

.drop-text p {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

/* ===== Mod Section ===== */
.mod-section {
  flex: 1;
}

.mod-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.mod-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.mod-count {
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
}

.empty-mods {
  text-align: center;
  padding: 48px;
  background: rgba(31, 41, 55, 0.3);
  border-radius: 16px;
}

.empty-mods .empty-icon {
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: 12px;
}

.empty-mods p {
  color: #fff;
  margin: 0 0 4px;
}

.empty-mods span {
  font-size: 13px;
  color: #718096;
}

.mod-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mod-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.2s;
}

.mod-card:hover {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(233, 69, 96, 0.3);
}

.mod-icon {
  font-size: 36px;
}

.mod-info {
  flex: 1;
  min-width: 0;
}

.mod-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.mod-title h4 {
  margin: 0;
  font-size: 15px;
  color: #fff;
}

.mod-date {
  font-size: 12px;
  color: #718096;
}

.mod-desc {
  font-size: 13px;
  color: #a0aec0;
  margin: 0 0 8px;
}

.mod-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mod-stats .stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #718096;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot.new { background: #10b981; }
.stat-dot.replace { background: #f59e0b; }

.stat-total {
  font-size: 12px;
  color: #718096;
}

.mod-actions {
  display: flex;
  gap: 8px;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1f2937;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
}

.modal-lg {
  max-width: 640px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.modal-icon {
  font-size: 24px;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.5);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(85vh - 140px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(26, 26, 46, 0.5);
}

/* ===== Form ===== */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #a0aec0;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #fff;
  background: rgba(31, 41, 55, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.2);
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group .form-input {
  flex: 1;
}

/* ===== Install Files ===== */
.install-files {
  background: rgba(26, 26, 46, 0.5);
  border-radius: 12px;
  padding: 16px;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #a0aec0;
}

.files-list {
  max-height: 150px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
  font-size: 16px;
}

.file-name {
  flex: 1;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: #718096;
  font-size: 12px;
}

.file-more {
  text-align: center;
  padding: 8px;
  color: #718096;
  font-size: 12px;
}

/* ===== File Detail List ===== */
.file-detail-list {
  max-height: 400px;
  overflow-y: auto;
}

.file-detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
}

.file-type {
  font-size: 16px;
}

.file-path {
  flex: 1;
  color: #a0aec0;
  font-family: monospace;
  font-size: 12px;
}

/* ===== Buttons ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 13px;
}

.btn-lg {
  padding: 14px 28px;
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  color: #fff;
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 69, 96, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #1a1a2e;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.btn-ghost {
  background: transparent;
  color: #a0aec0;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ===== Toast ===== */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #1f2937;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  font-size: 14px;
  color: #fff;
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast-icon {
  font-size: 18px;
}

/* ===== Animations ===== */
.animate-fadeIn { animation: fadeIn 0.3s ease; }
.animate-slideUp { animation: slideUp 0.4s ease; }
.animate-scaleIn { animation: scaleIn 0.3s ease; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* ===== Light Mode ===== */
.app-container.light-mode {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
}

.light-mode .title-bar {
  background: rgba(255, 255, 255, 0.95);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.light-mode .logo-main {
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.light-mode .logo-sub {
  color: #718096;
}

.light-mode .title-btn {
  color: #718096;
}

.light-mode .title-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a2e;
}

.light-mode .sidebar {
  background: rgba(255, 255, 255, 0.7);
  border-right-color: rgba(0, 0, 0, 0.06);
}

.light-mode .sidebar-header h3 {
  color: #718096;
}

.light-mode .game-card {
  background: rgba(255, 255, 255, 0.8);
}

.light-mode .game-card:hover {
  background: rgba(255, 255, 255, 0.95);
}

.light-mode .game-card.selected {
  background: rgba(233, 69, 96, 0.1);
}

.light-mode .game-card-name {
  color: #1a1a2e;
}

.light-mode .panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.9) 100%);
}

.light-mode .welcome-hero h1 {
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.light-mode .welcome-tagline {
  color: #718096;
}

.light-mode .feature-card {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.06);
}

.light-mode .feature-card:hover {
  background: rgba(255, 255, 255, 0.95);
}

.light-mode .feature-text h4 {
  color: #1a1a2e;
}

.light-mode .game-header-info h2 {
  color: #1a1a2e;
}

.light-mode .game-path {
  color: #718096;
}

.light-mode .target-header h3,
.light-mode .mod-header h3 {
  color: #1a1a2e;
}

.light-mode .target-item {
  background: rgba(255, 255, 255, 0.8);
}

.light-mode .target-item:hover {
  background: rgba(255, 255, 255, 0.95);
}

.light-mode .target-name {
  color: #1a1a2e;
}

.light-mode .drop-zone {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(0, 0, 0, 0.15);
}

.light-mode .drop-zone:hover {
  border-color: rgba(233, 69, 96, 0.5);
}

.light-mode .drop-text h3 {
  color: #1a1a2e;
}

.light-mode .drop-text p {
  color: #718096;
}

.light-mode .empty-mods {
  background: rgba(255, 255, 255, 0.5);
}

.light-mode .empty-mods p {
  color: #1a1a2e;
}

.light-mode .mod-card {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.06);
}

.light-mode .mod-card:hover {
  background: rgba(255, 255, 255, 0.95);
}

.light-mode .mod-title h4 {
  color: #1a1a2e;
}

.light-mode .mod-desc {
  color: #4a5568;
}

.light-mode .modal {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.1);
}

.light-mode .modal-header h3 {
  color: #1a1a2e;
}

.light-mode .modal-footer {
  background: #f7fafc;
  border-top-color: rgba(0, 0, 0, 0.06);
}

.light-mode .form-input {
  background: #f7fafc;
  border-color: rgba(0, 0, 0, 0.15);
  color: #1a1a2e;
}

.light-mode .form-label {
  color: #4a5568;
}

.light-mode .install-files {
  background: #f7fafc;
}

.light-mode .files-header {
  color: #4a5568;
}

.light-mode .file-name {
  color: #1a1a2e;
}

.light-mode .file-detail-item {
  border-bottom-color: rgba(0, 0, 0, 0.05);
}

.light-mode .file-path {
  color: #4a5568;
}

.light-mode .toast {
  background: #ffffff;
  color: #1a1a2e;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.light-mode .btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: #1a1a2e;
}

.light-mode .btn-secondary:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
}

.light-mode .btn-ghost {
  color: #718096;
}

.light-mode .btn-ghost:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a2e;
}

.light-mode .btn-close {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a2e;
}
</style>