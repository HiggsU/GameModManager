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
                :class="{ disabled: mod.installed === false }"
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
                  
                  <!-- 安装/卸载开关 -->
                  <button 
                    class="btn btn-sm toggle-btn"
                    :class="mod.installed !== false ? 'btn-success' : 'btn-secondary'"
                    @click="toggleMod(mod)"
                    :title="mod.installed !== false ? '点击卸载' : '点击安装'"
                  >
                    <svg v-if="mod.installed !== false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    {{ mod.installed !== false ? '已安装' : '未安装' }}
                  </button>
                  
                  <!-- 删除按钮 -->
                  <button class="btn btn-danger btn-sm" @click="deleteMod(mod)" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
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
      <div class="modal modal-lg animate-scaleIn">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">✨</span>
            创建 Mod
          </h3>
          <button class="btn-close" @click="cancelInstall">×</button>
        </div>
        <div class="modal-body">
          <!-- Mod 基本信息 -->
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Mod 名称</label>
              <input 
                v-model="installModName" 
                type="text" 
                class="form-input" 
                placeholder="给这个 Mod 起个名字"
              >
            </div>
            <div class="form-group flex-2">
              <label class="form-label">描述（可选）</label>
              <input 
                v-model="installModDesc" 
                type="text" 
                class="form-input" 
                placeholder="简要描述这个 Mod"
              >
            </div>
          </div>
          
          <!-- 多目录操作区域 -->
          <div class="mod-dirs-container">
            <div class="dirs-header">
              <span>目标目录操作</span>
              <small>为每个目录添加文件或选择要删除的内容</small>
            </div>
            
            <!-- 遍历所有目标目录 -->
            <div v-for="op in modOperations" :key="op.dirPath" class="dir-op-card">
              <div class="dir-op-header" @click="op.expanded = !op.expanded">
                <div class="dir-op-info">
                  <span class="dir-op-icon">📁</span>
                  <div class="dir-op-text">
                    <span class="dir-op-name">{{ op.dirName }}</span>
                    <span class="dir-op-path">{{ op.dirPath }}</span>
                  </div>
                </div>
                <div class="dir-op-stats">
                  <span v-if="op.addFiles.length" class="stat-badge add">
                    ✨ {{ op.addFiles.length }}
                  </span>
                  <span v-if="op.deleteItems.length" class="stat-badge del">
                    🗑️ {{ op.deleteItems.length }}
                  </span>
                  <span class="expand-btn">{{ op.expanded ? '▼' : '▶' }}</span>
                </div>
              </div>
              
              <div v-show="op.expanded" class="dir-op-body">
                <!-- 添加文件区域 -->
                <div class="op-section">
                  <div class="op-section-header">
                    <span class="op-section-title">
                      <span class="status-icon add">✨</span>
                      添加/替换文件
                    </span>
                    <button class="btn btn-secondary btn-xs" @click="selectFilesForDir(op.dirPath)">
                      + 添加文件
                    </button>
                  </div>
                  <div class="op-section-content">
                    <div v-if="op.addFiles.length === 0" class="op-empty">
                      点击"添加文件"或从主界面拖拽文件
                    </div>
                    <div v-else class="op-file-list">
                      <div v-for="(file, idx) in op.addFiles" :key="idx" class="op-file-item">
                        <span class="file-status" :class="file.status">
                          {{ file.status === 'new' ? '✨' : '🔄' }}
                        </span>
                        <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                        <span class="file-name">{{ file.relativePath || file.name }}</span>
                        <span class="file-size">{{ formatSize(file.size) }}</span>
                        <button class="file-remove-btn" @click="removeFileFromOp(op.dirPath, idx)">×</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 删除项目区域 -->
                <div class="op-section">
                  <div class="op-section-header">
                    <span class="op-section-title">
                      <span class="status-icon del">🗑️</span>
                      删除项目
                    </span>
                    <button class="btn btn-danger btn-xs" @click="browseDirForDelete(op.dirPath)">
                      📂 浏览目录
                    </button>
                  </div>
                  <div class="op-section-content">
                    <div v-if="op.deleteItems.length === 0" class="op-empty">
                      点击"浏览目录"选择要删除的文件或文件夹
                    </div>
                    <div v-else class="op-file-list">
                      <div v-for="(item, idx) in op.deleteItems" :key="idx" class="op-file-item delete">
                        <span class="file-status del">🗑️</span>
                        <span class="file-icon">{{ item.isDirectory ? '📁' : '📄' }}</span>
                        <span class="file-name">{{ item.name }}</span>
                        <button class="file-remove-btn" @click="removeDeleteFromOp(op.dirPath, idx)">×</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelInstall">取消</button>
          <button 
            class="btn btn-success" 
            @click="confirmInstall"
            :disabled="!hasAnyOperation"
          >
            <span>🚀</span> 创建 Mod
          </button>
        </div>
      </div>
    </div>
    
    <!-- 浏览目录选择删除项弹窗 -->
    <div v-if="showBrowseModal" class="modal-overlay">
      <div class="modal animate-scaleIn">
        <div class="modal-header">
          <h3>
            <span class="modal-icon">🗑️</span>
            选择要删除的项目
          </h3>
          <button class="btn-close" @click="showBrowseModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="browse-path">当前目录: {{ browsingDir }}</div>
          <div class="browse-list">
            <div v-if="browseTree.length === 0" class="browse-empty">
              目录为空
            </div>
            <template v-else>
              <BrowseNode 
                v-for="node in browseTree" 
                :key="node.path"
                :node="node"
                :selected-paths="selectedForDelete"
                :depth="0"
                @toggle-select="toggleSelectForDelete"
                @toggle-expand="toggleBrowseExpand"
              />
            </template>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showBrowseModal = false">取消</button>
          <button 
            class="btn btn-danger" 
            @click="confirmDeleteSelection"
            :disabled="selectedForDelete.length === 0"
          >
            确认选择 ({{ selectedForDelete.length }})
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
        <div class="modal-body mod-files-body">
          <!-- 统计信息 -->
          <div class="mod-files-stats">
            <div class="stat-item">
              <span class="stat-icon new">✨</span>
              <span class="stat-label">新增文件</span>
              <span class="stat-value">{{ selectedMod?.stats?.new || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon replace">🔄</span>
              <span class="stat-label">替换文件</span>
              <span class="stat-value">{{ selectedMod?.stats?.replaced || 0 }}</span>
            </div>
            <div class="stat-item" v-if="selectedMod?.stats?.deleted > 0">
              <span class="stat-icon delete">🗑️</span>
              <span class="stat-label">删除项目</span>
              <span class="stat-value">{{ selectedMod?.stats?.deleted || 0 }}</span>
            </div>
          </div>
          
          <!-- 删除的项目 -->
          <div v-if="selectedMod?.deletedItems?.length > 0" class="deleted-section">
            <div class="deleted-header" @click="deletedExpanded = !deletedExpanded">
              <span class="expand-icon">{{ deletedExpanded ? '▼' : '▶' }}</span>
              <span class="deleted-icon">🗑️</span>
              <span class="deleted-title">已删除的项目</span>
              <span class="deleted-count">{{ selectedMod.deletedItems.length }} 项</span>
            </div>
            <div v-show="deletedExpanded" class="deleted-list">
              <div v-for="item in selectedMod.deletedItems" :key="item.originalPath" class="deleted-item">
                <span class="item-icon">{{ item.isDirectory ? '📁' : '📄' }}</span>
                <span class="item-name">{{ item.relativePath || item.originalPath?.split(/[\\/]/).pop() }}</span>
                <span class="item-type">{{ item.isDirectory ? '文件夹' : '文件' }}</span>
              </div>
            </div>
          </div>
          
          <!-- 文件树 -->
          <div class="mod-files-tree">
            <template v-for="node in modFilesTree" :key="node.path || node.name">
              <!-- 文件夹 -->
              <div v-if="node.children" class="tree-folder">
                <div class="folder-header" @click="node.expanded = !node.expanded">
                  <span class="expand-icon">{{ node.expanded ? '▼' : '▶' }}</span>
                  <span class="folder-icon">📁</span>
                  <span class="folder-name">{{ node.name }}</span>
                  <span class="folder-count">{{ node.fileCount }} 个文件</span>
                </div>
                <div v-show="node.expanded" class="folder-children">
                  <div v-for="file in node.children" :key="file.destPath" class="tree-file">
                    <span class="file-status" :class="file.operationType">
                      {{ file.operationType === 'replace' ? '🔄' : '✨' }}
                    </span>
                    <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatSize(file.size) }}</span>
                  </div>
                </div>
              </div>
              <!-- 单个文件 -->
              <div v-else class="tree-file root-file">
                <span class="file-status" :class="node.operationType">
                  {{ node.operationType === 'replace' ? '🔄' : '✨' }}
                </span>
                <span class="file-icon">{{ getFileIcon(node.name) }}</span>
                <span class="file-name">{{ node.name }}</span>
                <span class="file-size">{{ formatSize(node.size) }}</span>
              </div>
            </template>
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

    <!-- 确认弹窗 -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal modal-sm animate-scaleIn">
        <div class="modal-header" :class="'type-' + confirmModal.type">
          <h3>
            <span class="modal-icon">
              {{ confirmModal.type === 'danger' ? '⚠️' : confirmModal.type === 'warning' ? '⚡' : 'ℹ️' }}
            </span>
            {{ confirmModal.title }}
          </h3>
        </div>
        <div class="modal-body">
          <p class="confirm-message">{{ confirmModal.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelConfirm">取消</button>
          <button 
            class="btn" 
            :class="confirmModal.type === 'danger' ? 'btn-danger' : 'btn-primary'"
            @click="confirmModal.onConfirm"
          >
            确认
          </button>
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
import { ref, reactive, onMounted, watch, computed, defineComponent, h, toRaw } from 'vue'

// 递归浏览节点组件
const BrowseNode = defineComponent({
  name: 'BrowseNode',
  props: {
    node: { type: Object, required: true },
    selectedPaths: { type: Array, required: true },
    depth: { type: Number, default: 0 }
  },
  emits: ['toggle-select', 'toggle-expand'],
  setup(props, { emit }) {
    const isSelected = computed(() => props.selectedPaths.includes(props.node.path))
    
    const handleSelect = (e) => {
      e.stopPropagation()
      emit('toggle-select', props.node)
    }
    
    const handleExpand = (e) => {
      e.stopPropagation()
      if (props.node.isDirectory) {
        emit('toggle-expand', props.node)
      }
    }
    
    return () => {
      const { node, depth, selectedPaths } = props
      const indent = depth * 20
      
      return h('div', { class: 'browse-node-wrapper' }, [
        // 当前节点行
        h('div', {
          class: ['browse-item', { selected: isSelected.value }],
          style: { paddingLeft: `${indent + 12}px` },
          onClick: handleSelect
        }, [
          // 展开/折叠按钮（仅目录）
          node.isDirectory ? h('span', {
            class: 'browse-expand-btn',
            onClick: handleExpand
          }, node.expanded ? '▼' : '▶') : h('span', { class: 'browse-expand-placeholder' }),
          
          // 复选框
          h('span', { class: 'browse-checkbox' }, isSelected.value ? '☑' : '☐'),
          
          // 图标
          h('span', { class: 'browse-icon' }, node.isDirectory ? '📁' : '📄'),
          
          // 名称
          h('span', { class: 'browse-name' }, node.name),
          
          // 大小（仅文件）
          !node.isDirectory ? h('span', { class: 'browse-size' }, formatSizeLocal(node.size)) : null
        ]),
        
        // 子节点（展开时）
        node.isDirectory && node.expanded && node.children ? 
          node.children.map(child => 
            h(BrowseNode, {
              key: child.path,
              node: child,
              selectedPaths: selectedPaths,
              depth: depth + 1,
              onToggleSelect: (n) => emit('toggle-select', n),
              onToggleExpand: (n) => emit('toggle-expand', n)
            })
          ) : null
      ])
    }
  }
})

// 格式化大小辅助函数
function formatSizeLocal(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default {
  name: 'App',
  components: {
    BrowseNode
  },
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
    const pendingDeleteItems = ref([]) // 要删除的文件/目录
    const installModName = ref('')
    const installModDesc = ref('')
    
    // 当前操作的目录
    const currentOpDir = ref('')
    // 多目录操作数据
    const modOperations = ref([]) // [{ dirPath, dirName, addFiles: [], deleteItems: [] }]
    
    // 浏览目录选择删除项
    const showBrowseModal = ref(false)
    const browsingDir = ref('')
    const browseTree = ref([]) // 树形结构
    const selectedForDelete = ref([]) // 改用数组而非Set
    
    // 确认弹窗
    const showConfirmModal = ref(false)
    const confirmModal = reactive({
      title: '',
      message: '',
      type: 'warning', // warning, danger, info
      onConfirm: null
    })
    
    // 文件状态缓存（用于预览）
    const fileStatusCache = ref({})
    
    // 计算树状结构
    const installTree = computed(() => {
      if (pendingFiles.value.length === 0) return []
      
      const tree = []
      const folderMap = new Map()
      
      // 按路径分组构建树
      for (const file of pendingFiles.value) {
        const parts = file.relativePath?.split(/[\\/]/) || [file.name]
        
        if (parts.length === 1) {
          tree.push({
            ...file,
            name: parts[0],
            status: fileStatusCache.value[file.relativePath] || 'new',
            children: null
          })
        } else {
          const folderName = parts[0]
          
          if (!folderMap.has(folderName)) {
            const folderNode = {
              name: folderName,
              path: folderName,
              children: [],
              fileCount: 0,
              expanded: true
            }
            folderMap.set(folderName, folderNode)
            tree.push(folderNode)
          }
          
          folderMap.get(folderName).children.push({
            ...file,
            name: parts[parts.length - 1],
            status: fileStatusCache.value[file.relativePath] || 'new'
          })
          folderMap.get(folderName).fileCount++
        }
      }
      
      return tree
    })
    
    // 统计新增和替换
    const installPreviewStats = computed(() => {
      let newCount = 0
      let replaceCount = 0
      
      for (const file of pendingFiles.value) {
        const status = fileStatusCache.value[file.relativePath] || 'new'
        if (status === 'new') newCount++
        else replaceCount++
      }
      
      return { new: newCount, replace: replaceCount }
    })
    
    // 选中的 Mod
    const selectedMod = ref(null)
    const deletedExpanded = ref(true)  // 删除项目默认展开
    
    // Mod 文件树
    const modFilesTree = computed(() => {
      if (!selectedMod.value?.files?.length) return []
      
      const tree = []
      const folderMap = new Map()
      
      for (const file of selectedMod.value.files) {
        const parts = file.relativePath?.split(/[\\/]/) || [file.name]
        
        if (parts.length === 1) {
          tree.push({
            ...file,
            name: parts[0],
            children: null
          })
        } else {
          const folderName = parts[0]
          
          if (!folderMap.has(folderName)) {
            const folderNode = {
              name: folderName,
              path: folderName,
              children: [],
              fileCount: 0,
              expanded: true
            }
            folderMap.set(folderName, folderNode)
            tree.push(folderNode)
          }
          
          folderMap.get(folderName).children.push({
            ...file,
            name: parts[parts.length - 1]
          })
          folderMap.get(folderName).fileCount++
        }
      }
      
      return tree
    })
    
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
      const confirmed = await showConfirm({
        title: '删除游戏',
        message: `确定要删除 "${selectedGame.value.name}" 吗？\n\n这将删除所有 Mod 备份，此操作不可撤销。`,
        type: 'danger'
      })
      if (!confirmed) return
      
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
      
      await window.electronAPI.saveGames(toRaw(games.value))
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
      
      await window.electronAPI.saveGames(toRaw(games.value))
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
      await window.electronAPI.saveGames(toRaw(games.value))
      selectedGame.value = games.value[idx]
      
      if (targetDirectory.value === path) {
        targetDirectory.value = selectedGame.value.rootPath
      }
    }

    // 递归获取目录内容
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

    // 初始化多目录操作数据
    const initModOperations = () => {
      modOperations.value = []
      
      if (!selectedGame.value) return
      
      // 添加游戏根目录
      modOperations.value.push({
        dirPath: selectedGame.value.rootPath,
        dirName: '游戏根目录',
        addFiles: [],
        deleteItems: [],
        expanded: true
      })
      
      // 添加自定义目录
      for (const dir of (selectedGame.value.directories || [])) {
        modOperations.value.push({
          dirPath: dir.path,
          dirName: dir.name,
          addFiles: [],
          deleteItems: [],
          expanded: false
        })
      }
    }

    // 检查是否有任何操作
    const hasAnyOperation = computed(() => {
      return modOperations.value.some(op => op.addFiles.length > 0 || op.deleteItems.length > 0)
    })

    // 拖拽处理
    const handleDrop = async (e) => {
      isDragging.value = false
      
      const items = e.dataTransfer.files
      const files = []
      
      for (const item of items) {
        const info = await window.electronAPI.getFileInfo(item.path)
        if (info.exists) {
          if (info.isDirectory) {
            const contents = await getDirectoryContents(item.path)
            files.push(...contents)
          } else {
            files.push({
              path: item.path,
              name: item.name,
              size: info.size,
              relativePath: item.name
            })
          }
        }
      }
      
      if (files.length > 0) {
        // 初始化操作数据
        initModOperations()
        
        // 将文件添加到当前选中的目标目录
        const currentOp = modOperations.value.find(op => op.dirPath === targetDirectory.value)
        if (currentOp) {
          // 检查文件状态
          for (const file of files) {
            const destPath = currentOp.dirPath + '\\' + (file.relativePath || file.name)
            const exists = await window.electronAPI.pathExists(destPath)
            file.status = exists ? 'replace' : 'new'
          }
          currentOp.addFiles = files
        }
        
        installModName.value = `Mod ${(selectedGame.value.mods?.length || 0) + 1}`
        installModDesc.value = ''
        showInstallModal.value = true
      }
    }

    // 选择文件（为当前目录）
    const selectFiles = async () => {
      const paths = await window.electronAPI.selectFiles()
      if (!paths?.length) return
      
      const files = []
      
      for (const p of paths) {
        const info = await window.electronAPI.getFileInfo(p)
        if (info.exists) {
          if (info.isDirectory) {
            const contents = await getDirectoryContents(p)
            files.push(...contents)
          } else {
            const fileName = p.split(/[\\/]/).pop()
            files.push({
              path: p,
              name: fileName,
              size: info.size,
              relativePath: fileName
            })
          }
        }
      }
      
      if (files.length > 0) {
        // 初始化操作数据
        initModOperations()
        
        // 将文件添加到当前选中的目标目录
        const currentOp = modOperations.value.find(op => op.dirPath === targetDirectory.value)
        if (currentOp) {
          // 检查文件状态
          for (const file of files) {
            const destPath = currentOp.dirPath + '\\' + (file.relativePath || file.name)
            const exists = await window.electronAPI.pathExists(destPath)
            file.status = exists ? 'replace' : 'new'
          }
          currentOp.addFiles = files
        }
        
        installModName.value = `Mod ${(selectedGame.value.mods?.length || 0) + 1}`
        installModDesc.value = ''
        showInstallModal.value = true
      }
    }

    // 为指定目录选择文件
    const selectFilesForDir = async (dirPath) => {
      const paths = await window.electronAPI.selectFiles()
      if (!paths?.length) return
      
      const files = []
      
      for (const p of paths) {
        const info = await window.electronAPI.getFileInfo(p)
        if (info.exists) {
          if (info.isDirectory) {
            const contents = await getDirectoryContents(p)
            files.push(...contents)
          } else {
            const fileName = p.split(/[\\/]/).pop()
            files.push({
              path: p,
              name: fileName,
              size: info.size,
              relativePath: fileName
            })
          }
        }
      }
      
      // 检查文件状态并添加
      const op = modOperations.value.find(o => o.dirPath === dirPath)
      if (op) {
        for (const file of files) {
          const destPath = dirPath + '\\' + (file.relativePath || file.name)
          const exists = await window.electronAPI.pathExists(destPath)
          file.status = exists ? 'replace' : 'new'
        }
        op.addFiles.push(...files)
      }
    }

    // 从操作中移除文件
    const removeFileFromOp = (dirPath, index) => {
      const op = modOperations.value.find(o => o.dirPath === dirPath)
      if (op) {
        op.addFiles.splice(index, 1)
      }
    }

    // 从操作中移除删除项
    const removeDeleteFromOp = (dirPath, index) => {
      const op = modOperations.value.find(o => o.dirPath === dirPath)
      if (op) {
        op.deleteItems.splice(index, 1)
      }
    }

    // 浏览目录选择要删除的项目
    const browseDirForDelete = async (dirPath) => {
      browsingDir.value = dirPath
      selectedForDelete.value = []
      
      // 加载根目录内容
      browseTree.value = await loadBrowseChildrenInternal(dirPath)
      
      showBrowseModal.value = true
    }
    
    // 内部函数：加载子目录内容
    const loadBrowseChildrenInternal = async (parentPath) => {
      const result = await window.electronAPI.listDirectory(parentPath)
      if (!result.success) return []
      
      return result.files.map(item => ({
        ...item,
        expanded: false,
        loaded: false,
        children: null
      }))
    }
    
    // 切换目录展开
    const toggleBrowseExpand = async (node) => {
      if (!node.isDirectory) return
      
      if (!node.loaded) {
        // 首次展开，加载子目录
        node.children = await loadBrowseChildrenInternal(node.path)
        node.loaded = true
      }
      node.expanded = !node.expanded
      // 触发响应式更新
      browseTree.value = [...browseTree.value]
    }
    
    // 加载子节点（用于递归组件）
    const loadBrowseChildren = async (node) => {
      if (!node.isDirectory) return
      node.children = await loadBrowseChildrenInternal(node.path)
      node.loaded = true
      node.expanded = true
      browseTree.value = [...browseTree.value]
    }

    // 切换选择删除项
    const toggleSelectForDelete = (item) => {
      const index = selectedForDelete.value.indexOf(item.path)
      if (index > -1) {
        // 取消选择：移除该项及其所有子项
        removeSelectionRecursive(item)
      } else {
        // 选择：添加该项
        selectedForDelete.value.push(item.path)
        // 如果是目录，同时选择所有子项
        if (item.isDirectory && item.children) {
          selectChildrenRecursive(item)
        }
      }
    }
    
    // 递归选择所有子项
    const selectChildrenRecursive = (node) => {
      if (node.children) {
        for (const child of node.children) {
          if (!selectedForDelete.value.includes(child.path)) {
            selectedForDelete.value.push(child.path)
          }
          if (child.children) {
            selectChildrenRecursive(child)
          }
        }
      }
    }
    
    // 递归移除选择
    const removeSelectionRecursive = (node) => {
      const idx = selectedForDelete.value.indexOf(node.path)
      if (idx > -1) {
        selectedForDelete.value.splice(idx, 1)
      }
      if (node.children) {
        for (const child of node.children) {
          removeSelectionRecursive(child)
        }
      }
    }

    // 确认删除选择
    const confirmDeleteSelection = () => {
      const op = modOperations.value.find(o => o.dirPath === browsingDir.value)
      if (op) {
        // 遍历选中的路径
        for (const path of selectedForDelete.value) {
          // 检查是否已存在
          if (!op.deleteItems.some(d => d.path === path)) {
            // 从树中找到对应节点获取信息
            const findNode = (nodes, targetPath) => {
              for (const node of nodes) {
                if (node.path === targetPath) return node
                if (node.children) {
                  const found = findNode(node.children, targetPath)
                  if (found) return found
                }
              }
              return null
            }
            const node = findNode(browseTree.value, path)
            if (node) {
              op.deleteItems.push({
                path: node.path,
                name: node.name,
                isDirectory: node.isDirectory,
                size: node.size
              })
            }
          }
        }
      }
      showBrowseModal.value = false
    }

    const cancelInstall = () => {
      showInstallModal.value = false
      modOperations.value = []
    }

    const confirmInstall = async () => {
      if (!hasAnyOperation.value) return
      
      showInstallModal.value = false
      
      // 收集所有目录的操作
      const allSourceItems = []
      const allDeleteItems = []
      
      for (const op of modOperations.value) {
        // 添加文件
        for (const file of op.addFiles) {
          allSourceItems.push({
            path: file.path,
            relativePath: file.relativePath || file.name,
            targetDir: op.dirPath
          })
        }
        // 删除项
        for (const item of op.deleteItems) {
          allDeleteItems.push({
            path: item.path,
            isDirectory: item.isDirectory
          })
        }
      }
      
      const result = await window.electronAPI.installMod({
        gameId: selectedGame.value.id,
        modName: installModName.value || '未命名 Mod',
        modDescription: installModDesc.value || '',
        sourceItems: allSourceItems,
        deleteItems: allDeleteItems
      })
      
      if (result.success) {
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
        showToast(`Mod "${installModName.value}" 创建成功！`)
        modOperations.value = []
      } else {
        showToast('创建失败: ' + result.error, 'error')
      }
    }

    // Mod 操作
    const showModFiles = (mod) => {
      selectedMod.value = mod
      showFilesModal.value = true
    }

    // 显示确认弹窗
    const showConfirm = (options) => {
      return new Promise((resolve) => {
        confirmModal.title = options.title || '确认'
        confirmModal.message = options.message || ''
        confirmModal.type = options.type || 'warning'
        confirmModal.onConfirm = () => {
          showConfirmModal.value = false
          resolve(true)
        }
        showConfirmModal.value = true
        
        // 点击取消或关闭
        window._confirmResolve = resolve
      })
    }
    
    const cancelConfirm = () => {
      showConfirmModal.value = false
      if (window._confirmResolve) {
        window._confirmResolve(false)
        window._confirmResolve = null
      }
    }

    // 切换 Mod 安装状态
    const toggleMod = async (mod) => {
      if (mod.installed !== false) {
        // 当前已安装，执行卸载
        const confirmed = await showConfirm({
          title: '卸载 Mod',
          message: `确定要卸载 "${mod.name}" 吗？\n这将恢复被替换的文件并删除新增的文件。`,
          type: 'danger'
        })
        if (!confirmed) return
        
        const result = await window.electronAPI.restoreMod({
          gameId: selectedGame.value.id,
          modId: mod.id
        })
        
        if (result.success) {
          await loadGames()
          selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
          showToast(`Mod "${mod.name}" 已卸载`, 'success')
        } else {
          showToast('卸载失败: ' + result.error, 'error')
        }
      } else {
        // 当前未安装，执行安装
        const result = await window.electronAPI.reinstallMod({
          gameId: selectedGame.value.id,
          modId: mod.id
        })
        
        if (result.success) {
          await loadGames()
          selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
          showToast(`Mod "${mod.name}" 已安装`, 'success')
        } else {
          showToast('安装失败: ' + result.error, 'error')
        }
      }
    }

    // 删除 Mod
    const deleteMod = async (mod) => {
      const isInstalled = mod.installed !== false
      
      let message = ''
      if (isInstalled) {
        message = `该 Mod 当前已安装，删除后：\n• 将还原所有被修改的文件\n• 删除所有备份文件\n• 此操作不可撤销\n\n是否继续？`
      } else {
        message = `将删除该 Mod 的配置记录，此操作不可撤销。`
      }
      
      const confirmed = await showConfirm({
        title: `删除 "${mod.name}"`,
        message: message,
        type: 'danger'
      })
      if (!confirmed) return
      
      // 如果已安装，先还原
      if (isInstalled) {
        const restoreResult = await window.electronAPI.restoreMod({
          gameId: selectedGame.value.id,
          modId: mod.id
        })
        if (!restoreResult.success) {
          showToast('还原失败: ' + restoreResult.error, 'error')
          return
        }
      }
      
      // 删除记录
      const result = await window.electronAPI.deleteModHistory({
        gameId: selectedGame.value.id,
        modId: mod.id
      })
      
      if (result.success) {
        await loadGames()
        selectedGame.value = games.value.find(g => g.id === selectedGame.value.id)
        showToast(`Mod "${mod.name}" 已删除`)
      } else {
        showToast('删除失败: ' + result.error, 'error')
      }
    }

    const restoreAllMods = async () => {
      const confirmed = await showConfirm({
        title: '还原所有 Mod',
        message: '确定要还原所有 Mod 吗？\n\n这将恢复游戏到安装 Mod 之前的状态，所有 Mod 将变为未安装状态。',
        type: 'warning'
      })
      if (!confirmed) return
      
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
      isDragging, installModName, installModDesc,
      selectedMod, modFilesTree, deletedExpanded, editGameName, editGamePath, toast,
      newGame, newDir,
      modOperations, hasAnyOperation,
      showBrowseModal, browsingDir, browseTree, selectedForDelete,
      showConfirmModal, confirmModal,
      
      showToast, getGameIcon, getModIcon, getFileIcon, formatSize, formatDate,
      minimizeWindow, maximizeWindow, closeWindow, toggleTheme,
      loadGames, selectGame, openFolder,
      openAddGameModal, closeAddGameModal, selectGameRootPath, addGame,
      confirmDeleteGame, selectEditPath, updateGame,
      selectDirPath, addDirectory, removeDirectory,
      handleDrop, selectFiles, cancelInstall, confirmInstall,
      selectFilesForDir, removeFileFromOp, removeDeleteFromOp,
      browseDirForDelete, toggleBrowseExpand, loadBrowseChildren, toggleSelectForDelete, confirmDeleteSelection,
      showModFiles, toggleMod, deleteMod, restoreAllMods, cancelConfirm
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
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.mod-card:hover {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(233, 69, 96, 0.4);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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

/* Toggle Button */
.toggle-btn {
  min-width: 90px;
  justify-content: center;
}

.toggle-btn.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: transparent;
}

.toggle-btn.btn-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.toggle-btn.btn-secondary {
  background: rgba(113, 128, 150, 0.2);
  border-color: rgba(113, 128, 150, 0.3);
  color: #a0aec0;
}

.toggle-btn.btn-secondary:hover {
  background: rgba(113, 128, 150, 0.3);
}

/* Mod Card Disabled State */
.mod-card.disabled {
  opacity: 0.6;
  background: rgba(31, 41, 55, 0.3);
}

.mod-card.disabled .mod-icon {
  filter: grayscale(1);
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

.modal-sm {
  max-width: 380px;
}

.modal-header.type-danger {
  background: rgba(239, 68, 68, 0.1);
  border-bottom-color: rgba(239, 68, 68, 0.2);
}

.modal-header.type-warning {
  background: rgba(245, 158, 11, 0.1);
  border-bottom-color: rgba(245, 158, 11, 0.2);
}

.modal-header.type-info {
  background: rgba(99, 102, 241, 0.1);
  border-bottom-color: rgba(99, 102, 241, 0.2);
}

.confirm-message {
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
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

/* ===== Mod Files Tree ===== */
.mod-files-body {
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mod-files-stats {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 16px;
}

.mod-files-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mod-files-stats .stat-icon {
  font-size: 18px;
}

.mod-files-stats .stat-icon.new { color: #10b981; }
.mod-files-stats .stat-icon.replace { color: #f59e0b; }
.mod-files-stats .stat-icon.total { color: #a78bfa; }
.mod-files-stats .stat-icon.delete { color: #ef4444; }

.mod-files-stats .stat-label {
  color: #718096;
  font-size: 13px;
}

.mod-files-stats .stat-value {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

/* ===== Deleted Section ===== */
.deleted-section {
  margin-bottom: 16px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.deleted-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.deleted-header:hover {
  background: rgba(239, 68, 68, 0.15);
}

.deleted-header .expand-icon {
  color: #ef4444;
  font-size: 10px;
  width: 14px;
  text-align: center;
}

.deleted-header .deleted-icon {
  font-size: 16px;
}

.deleted-header .deleted-title {
  flex: 1;
  color: #fca5a5;
  font-weight: 500;
}

.deleted-header .deleted-count {
  color: #ef4444;
  font-size: 12px;
  background: rgba(239, 68, 68, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.deleted-list {
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.deleted-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.15s;
}

.deleted-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.deleted-item .item-icon {
  font-size: 14px;
}

.deleted-item .item-name {
  flex: 1;
  color: #e2e8f0;
  font-size: 13px;
}

.deleted-item .item-type {
  color: #718096;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.mod-files-tree {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.mod-files-tree .tree-folder {
  margin-bottom: 8px;
}

.mod-files-tree .folder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mod-files-tree .folder-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mod-files-tree .expand-icon {
  color: #718096;
  font-size: 10px;
  width: 14px;
  text-align: center;
}

.mod-files-tree .folder-icon {
  font-size: 16px;
}

.mod-files-tree .folder-name {
  flex: 1;
  color: #fff;
  font-weight: 500;
}

.mod-files-tree .folder-count {
  color: #718096;
  font-size: 12px;
}

.mod-files-tree .folder-children {
  padding-left: 24px;
  margin-top: 4px;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  margin-left: 18px;
}

.mod-files-tree .tree-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.15s;
}

.mod-files-tree .tree-file:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mod-files-tree .tree-file.root-file {
  margin-bottom: 4px;
}

.mod-files-tree .file-status {
  font-size: 14px;
}

.mod-files-tree .file-status.new { color: #10b981; }
.mod-files-tree .file-status.replace { color: #f59e0b; }

.mod-files-tree .file-icon {
  font-size: 14px;
}

.mod-files-tree .file-name {
  flex: 1;
  color: #e2e8f0;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mod-files-tree .file-size {
  color: #718096;
  font-size: 11px;
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
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.light-mode .mod-card:hover {
  background: #ffffff;
  border-color: rgba(233, 69, 96, 0.4);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
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

.light-mode .modal-header.type-danger {
  background: rgba(239, 68, 68, 0.08);
}

.light-mode .modal-header.type-warning {
  background: rgba(245, 158, 11, 0.08);
}

.light-mode .modal-header.type-info {
  background: rgba(99, 102, 241, 0.08);
}

.light-mode .confirm-message {
  color: #2d3748;
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

.light-mode .mod-files-stats {
  background: rgba(0, 0, 0, 0.03);
}

.light-mode .mod-files-stats .stat-label {
  color: #4a5568;
}

.light-mode .mod-files-stats .stat-value {
  color: #1a1a2e;
}

.light-mode .mod-files-tree .folder-header {
  background: rgba(0, 0, 0, 0.03);
}

.light-mode .mod-files-tree .folder-header:hover {
  background: rgba(0, 0, 0, 0.06);
}

.light-mode .mod-files-tree .folder-name {
  color: #1a1a2e;
}

.light-mode .mod-files-tree .folder-children {
  border-left-color: rgba(0, 0, 0, 0.08);
}

.light-mode .mod-files-tree .tree-file:hover {
  background: rgba(0, 0, 0, 0.03);
}

.light-mode .mod-files-tree .file-name {
  color: #2d3748;
}

.light-mode .deleted-section {
  border-color: rgba(239, 68, 68, 0.3);
}

.light-mode .deleted-header {
  background: rgba(239, 68, 68, 0.08);
}

.light-mode .deleted-header:hover {
  background: rgba(239, 68, 68, 0.12);
}

.light-mode .deleted-header .deleted-title {
  color: #dc2626;
}

.light-mode .deleted-list {
  background: rgba(0, 0, 0, 0.02);
}

.light-mode .deleted-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.light-mode .deleted-item .item-name {
  color: #374151;
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

/* Light mode for install stats */
.light-mode .install-stats {
  background: rgba(0, 0, 0, 0.03);
}

.light-mode .install-stats .stat-label {
  color: #718096;
}

.light-mode .install-stats .stat-value {
  color: #1a1a2e;
}

/* Light mode for install tree */
.light-mode .install-tree {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.08);
}

.light-mode .install-tree .tree-header {
  background: rgba(0, 0, 0, 0.03);
  border-bottom-color: rgba(0, 0, 0, 0.05);
}

.light-mode .install-tree .tree-folder {
  background: rgba(0, 0, 0, 0.02);
}

.light-mode .install-tree .folder-header:hover {
  background: rgba(0, 0, 0, 0.05);
}

.light-mode .install-tree .folder-name {
  color: #1a1a2e;
}

.light-mode .install-tree .tree-file {
  background: rgba(0, 0, 0, 0.02);
}

.light-mode .install-tree .tree-file:hover {
  background: rgba(0, 0, 0, 0.05);
}

.light-mode .install-tree .file-name {
  color: #2d3748;
}

.light-mode .install-tree .file-path {
  color: #718096;
}

.light-mode .install-tree .delete-file {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.15);
}

/* ===== Install Columns (两列布局) ===== */
.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  margin-bottom: 16px;
}

.form-row .flex-1 {
  flex: 1;
}

.form-row .flex-2 {
  flex: 2;
}

.install-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}

.install-column {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
  font-weight: 600;
  color: #a0aec0;
}

.column-content {
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: #718096;
  font-size: 13px;
}

.delete-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.delete-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  transition: all 0.2s;
}

.delete-item:hover {
  background: rgba(239, 68, 68, 0.15);
}

.delete-icon {
  font-size: 16px;
}

.delete-path {
  flex: 1;
  font-size: 12px;
  color: #a0aec0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-remove {
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-remove:hover {
  background: #ef4444;
}

/* ===== Mod Dirs Container ===== */
.mod-dirs-container {
  margin-top: 16px;
}

.dirs-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.dirs-header span {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.dirs-header small {
  font-size: 12px;
  color: #718096;
}

.dir-op-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.dir-op-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dir-op-header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.dir-op-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dir-op-icon {
  font-size: 20px;
}

.dir-op-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dir-op-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.dir-op-path {
  font-size: 11px;
  color: #718096;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dir-op-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.stat-badge.add {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-badge.del {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.expand-btn {
  font-size: 10px;
  color: #718096;
  width: 20px;
  text-align: center;
}

.dir-op-body {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.op-section {
  margin-bottom: 16px;
}

.op-section:last-child {
  margin-bottom: 0;
}

.op-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.op-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #a0aec0;
}

.status-icon.add {
  color: #10b981;
}

.status-icon.del {
  color: #ef4444;
}

.op-section-content {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.op-empty {
  text-align: center;
  padding: 16px;
  color: #718096;
  font-size: 13px;
}

.op-file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
}

.op-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.op-file-item.delete {
  background: rgba(239, 68, 68, 0.08);
}

.op-file-item .file-status {
  font-size: 12px;
  width: 18px;
  text-align: center;
}

.op-file-item .file-status.add {
  color: #10b981;
}

.op-file-item .file-status.del {
  color: #ef4444;
}

.op-file-item .file-icon {
  font-size: 14px;
}

.op-file-item .file-name {
  flex: 1;
  font-size: 12px;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.op-file-item .file-size {
  font-size: 11px;
  color: #718096;
}

.file-remove-btn {
  width: 18px;
  height: 18px;
  border: none;
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.op-file-item:hover .file-remove-btn {
  opacity: 1;
}

.file-remove-btn:hover {
  background: #ef4444;
}

/* Browse Modal */
.browse-path {
  font-size: 12px;
  color: #718096;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.browse-list {
  max-height: 300px;
  overflow-y: auto;
}

.browse-empty {
  text-align: center;
  padding: 24px;
  color: #718096;
}

.browse-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.browse-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.browse-item.selected {
  background: rgba(239, 68, 68, 0.1);
}

.browse-checkbox {
  font-size: 16px;
  color: #718096;
  width: 20px;
}

.browse-item.selected .browse-checkbox {
  color: #ef4444;
}

.browse-icon {
  font-size: 18px;
}

.browse-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16px;
}

.browse-size {
  font-size: 11px;
  color: #94a3b8;
  flex-shrink: 0;
  padding: 3px 10px;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 4px;
  font-weight: 500;
  margin-left: auto;
}

/* Button sizes */
.btn-xs {
  padding: 4px 8px;
  font-size: 11px;
}

/* Light mode */
.light-mode .dir-op-card {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.08);
}

.light-mode .dir-op-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.light-mode .dir-op-name {
  color: #1a1a2e;
}

.light-mode .dir-op-body {
  border-top-color: rgba(0, 0, 0, 0.05);
}

.light-mode .op-section-content {
  background: rgba(0, 0, 0, 0.03);
}

.light-mode .op-file-item {
  background: rgba(0, 0, 0, 0.03);
}

.light-mode .op-file-item .file-name {
  color: #2d3748;
}

.light-mode .browse-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.light-mode .browse-item.selected {
  background: rgba(239, 68, 68, 0.1);
}

.light-mode .browse-name {
  color: #2d3748;
}

.light-mode .browse-path {
  background: rgba(0, 0, 0, 0.03);
}

/* ===== Install Stats ===== */
.install-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.install-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.install-stats .stat-icon {
  font-size: 16px;
}

.install-stats .stat-icon.new {
  color: #10b981;
}

.install-stats .stat-icon.replace {
  color: #f59e0b;
}

.install-stats .stat-label {
  font-size: 12px;
  color: #718096;
}

.install-stats .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

/* ===== Install Actions ===== */
.install-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

/* ===== Install Tree ===== */
.install-tree {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.install-tree .tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
  font-weight: 600;
  color: #a0aec0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.install-tree .tree-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.install-tree .tree-node {
  margin-bottom: 4px;
}

.install-tree .tree-folder {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
}

.install-tree .folder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.install-tree .folder-header:hover {
  background: rgba(255, 255, 255, 0.06);
}

.install-tree .expand-icon {
  font-size: 10px;
  color: #a0aec0;
  width: 12px;
}

.install-tree .folder-icon {
  font-size: 18px;
}

.install-tree .folder-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.install-tree .folder-count {
  font-size: 12px;
  color: #718096;
}

.install-tree .folder-children {
  padding: 0 12px 8px 32px;
}

.install-tree .tree-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 4px;
}

.install-tree .tree-file:hover {
  background: rgba(255, 255, 255, 0.06);
}

.install-tree .file-status {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.install-tree .file-status.new {
  color: #10b981;
}

.install-tree .file-status.replace {
  color: #f59e0b;
}

.install-tree .file-status.delete {
  color: #ef4444;
}

.install-tree .file-icon {
  font-size: 16px;
}

.install-tree .file-name {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.install-tree .file-path {
  font-size: 11px;
  color: #718096;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.install-tree .file-remove {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.install-tree .tree-file:hover .file-remove {
  opacity: 1;
}

.install-tree .file-remove:hover {
  background: #ef4444;
}

.install-tree .delete-file {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.1);
}

/* ===== Browse Tree Styles ===== */
.browse-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.browse-empty {
  padding: 40px;
  text-align: center;
  color: #718096;
}

.browse-node-wrapper {
  user-select: none;
}

.browse-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 4px;
  cursor: pointer;
}

.browse-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.browse-item.selected {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  padding-left: 9px;
}

.browse-expand-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #718096;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.browse-expand-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.browse-expand-placeholder {
  width: 18px;
  flex-shrink: 0;
}

.browse-checkbox {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
  color: #6366f1;
}

.browse-item.selected .browse-checkbox {
  color: #ef4444;
}

.browse-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.browse-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16px;
}

.browse-size {
  font-size: 11px;
  color: #94a3b8;
  flex-shrink: 0;
  padding: 3px 10px;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 4px;
  font-weight: 500;
  margin-left: auto;
}

.browse-path {
  padding: 10px 12px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  font-size: 12px;
  color: #718096;
  word-break: break-all;
}

/* Light mode browse styles */
.light-mode .browse-list {
  background: rgba(0, 0, 0, 0.06);
}

.light-mode .browse-item {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.light-mode .browse-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.light-mode .browse-item.selected {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 3px solid #ef4444;
}

.light-mode :deep(.browse-name) {
  color: #1a202c !important;
  font-weight: 500;
}

.light-mode :deep(.browse-size) {
  color: #64748b !important;
  background: rgba(100, 116, 139, 0.12);
}

.light-mode .browse-path {
  background: rgba(0, 0, 0, 0.06);
  color: #2d3748 !important;
}

.light-mode :deep(.browse-checkbox) {
  color: #4a5568 !important;
  font-size: 20px;
}

.light-mode :deep(.browse-item.selected .browse-checkbox) {
  color: #ef4444 !important;
}

.light-mode :deep(.browse-expand-btn) {
  color: #4a5568 !important;
}

.light-mode :deep(.browse-expand-btn:hover) {
  background: rgba(0, 0, 0, 0.08);
  color: #1a202c !important;
}

.light-mode :deep(.browse-icon) {
  filter: none;
}
</style>

<!-- 非作用域样式，用于确保浏览弹窗在白天模式下正确显示 -->
<style>
.light-mode .browse-name {
  color: #1a202c !important;
}

.light-mode .browse-size {
  color: #64748b !important;
  background: rgba(100, 116, 139, 0.15) !important;
}

.light-mode .browse-checkbox {
  color: #4a5568 !important;
}

.light-mode .browse-item.selected .browse-checkbox {
  color: #ef4444 !important;
}

.light-mode .browse-expand-btn {
  color: #4a5568 !important;
}
</style>