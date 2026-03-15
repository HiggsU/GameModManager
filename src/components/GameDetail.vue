<template>
  <div class="game-detail">
    <!-- 游戏头部信息 -->
    <div class="game-header">
      <div class="game-info">
        <h1 class="game-title">🎮 {{ game.name }}</h1>
        <div class="game-path">📂 {{ game.rootPath }}</div>
        <div class="game-stats">
          <span class="stat-item">
            <span class="stat-icon">📁</span>
            {{ game.directories?.length || 0 }} 个目录配置
          </span>
          <span class="stat-item">
            <span class="stat-icon">🎯</span>
            {{ game.mods?.length || 0 }} 个Mod文件
          </span>
        </div>
      </div>
      <div class="game-actions">
        <button class="btn btn-danger btn-small" @click="$emit('delete')">
          🗑️ 删除游戏
        </button>
      </div>
    </div>

    <!-- 目录配置区 -->
    <section class="section directories-section">
      <div class="section-header">
        <h2>📁 Mod目录配置</h2>
        <button class="btn btn-primary btn-small" @click="$emit('add-directory')">
          ➕ 添加目录
        </button>
      </div>
      
      <div class="directories-grid" v-if="game.directories?.length">
        <div 
          class="directory-card" 
          v-for="dir in game.directories" 
          :key="dir.id"
          @dragover.prevent="handleDragOver($event, dir)"
          @dragleave="handleDragLeave($event, dir)"
          @drop.prevent="handleDrop($event, dir)"
          :class="{ 'drag-over': dragOverDir === dir.id }"
        >
          <div class="dir-header">
            <div class="dir-icon">📂</div>
            <div class="dir-info">
              <div class="dir-alias">{{ dir.alias }}</div>
              <div class="dir-path">{{ dir.path }}</div>
            </div>
            <button class="btn btn-icon btn-secondary btn-small" @click.stop="$emit('delete-directory', dir.id)">
              ✕
            </button>
          </div>
          <div class="dir-status">
            <span class="status-dot" :class="dir.exists ? 'exists' : 'missing'"></span>
            {{ dir.exists ? '目录存在' : '目录不存在' }}
          </div>
          <div class="drop-hint">
            <span>🎯 拖拽Mod文件到此处安装</span>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">📂</div>
        <div class="empty-title">还没有配置目录</div>
        <div class="empty-desc">先添加游戏的Mod目标目录，然后就可以拖拽文件安装Mod了</div>
      </div>
    </section>

    <!-- Mod记录区 -->
    <section class="section mods-section">
      <div class="section-header">
        <h2>🎯 Mod记录</h2>
        <button 
          v-if="game.mods?.length" 
          class="btn btn-warning btn-small" 
          @click="$emit('restore-all')"
        >
          🔄 一键还原所有
        </button>
      </div>

      <div class="mods-list" v-if="game.mods?.length">
        <!-- 按批次分组显示 -->
        <div 
          class="mod-batch" 
          v-for="batch in batches" 
          :key="batch.id"
        >
          <div class="batch-header">
            <div class="batch-info">
              <span class="batch-time">🕐 {{ formatTime(batch.id) }}</span>
              <span class="batch-count">{{ batch.mods.length }} 个文件</span>
            </div>
            <button class="btn btn-small btn-secondary" @click="$emit('restore-batch', batch.id)">
              🔄 还原此批次
            </button>
          </div>
          <div class="batch-mods">
            <div class="mod-item" v-for="mod in batch.mods" :key="mod.id">
              <div class="mod-info">
                <span class="mod-icon">{{ mod.action === 'add' ? '➕' : '🔄' }}</span>
                <span class="mod-name">{{ mod.fileName }}</span>
                <span class="tag" :class="mod.action === 'add' ? 'tag-add' : 'tag-replace'">
                  {{ mod.action === 'add' ? '新增' : '替换' }}
                </span>
              </div>
              <div class="mod-actions">
                <button class="btn btn-small btn-secondary" @click="$emit('restore-mod', mod.id)">
                  还原
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-title">还没有安装Mod</div>
        <div class="empty-desc">拖拽Mod文件到上面的目录配置即可安装</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  game: Object
})

defineEmits(['delete', 'add-directory', 'delete-directory', 'add-mods', 'restore-mod', 'restore-batch', 'restore-all'])

const dragOverDir = ref(null)

// 按批次分组Mods
const batches = computed(() => {
  if (!props.game.mods) return []
  
  const batchMap = new Map()
  props.game.mods.forEach(mod => {
    if (!batchMap.has(mod.batchId)) {
      batchMap.set(mod.batchId, {
        id: mod.batchId,
        mods: []
      })
    }
    batchMap.get(mod.batchId).mods.push(mod)
  })
  
  return Array.from(batchMap.values()).sort((a, b) => b.id - a.id)
})

const handleDragOver = (e, dir) => {
  e.preventDefault()
  dragOverDir.value = dir.id
}

const handleDragLeave = (e, dir) => {
  dragOverDir.value = null
}

const handleDrop = async (e, dir) => {
  dragOverDir.value = null
  
  const files = Array.from(e.dataTransfer.files).map(f => f.path)
  if (files.length > 0) {
    emit('add-mods', { dirId: dir.id, files })
  }
}

const emit = defineEmits()

const formatTime = (timestamp) => {
  const date = new Date(parseInt(timestamp))
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.game-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
}

.game-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}

.game-path {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
  word-break: break-all;
}

.game-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 18px;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.directories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.directory-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 2px solid var(--border-color);
  transition: var(--transition);
  cursor: pointer;
}

.directory-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.directory-card.drag-over {
  border-color: var(--success);
  background: rgba(85, 239, 196, 0.1);
  box-shadow: 0 0 20px rgba(85, 239, 196, 0.3);
}

.dir-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.dir-icon {
  font-size: 32px;
}

.dir-info {
  flex: 1;
  min-width: 0;
}

.dir-alias {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.dir-path {
  font-size: 12px;
  color: var(--text-muted);
  word-break: break-all;
}

.dir-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.exists {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}

.status-dot.missing {
  background: var(--danger);
  box-shadow: 0 0 8px var(--danger);
}

.drop-hint {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  border: 1px dashed var(--border-color);
}

.mods-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mod-batch {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.batch-time {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.batch-count {
  font-size: 13px;
  color: var(--text-muted);
}

.batch-mods {
  padding: 8px;
}

.mod-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.mod-item:hover {
  background: var(--bg-hover);
}

.mod-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mod-icon {
  font-size: 18px;
}

.mod-name {
  font-size: 14px;
  color: var(--text-primary);
}
</style>