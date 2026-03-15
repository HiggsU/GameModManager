<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">📁 添加Mod目录配置</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="game-info-card">
          <div class="game-icon">🎮</div>
          <div>
            <div class="game-name">{{ game.name }}</div>
            <div class="game-root">{{ game.rootPath }}</div>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">目录别名</label>
          <input 
            type="text" 
            class="input" 
            v-model="form.alias"
            placeholder="给目录起个好记的名字，如：Mods文件夹"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">相对路径</label>
          <input 
            type="text" 
            class="input" 
            v-model="form.dirPath"
            placeholder="相对于游戏根目录的路径，如：Mods 或 BepInEx/plugins"
          />
          <div class="form-hint">
            完整路径：{{ fullPath || '（请输入相对路径）' }}
          </div>
        </div>
        
        <div class="path-hints">
          <div class="hint-title">💡 常见Mod目录示例</div>
          <div class="hint-list">
            <span class="hint-tag" @click="form.dirPath = 'BepInEx/plugins'">BepInEx/plugins</span>
            <span class="hint-tag" @click="form.dirPath = 'BepInEx/config'">BepInEx/config</span>
            <span class="hint-tag" @click="form.dirPath = 'Mods'">Mods</span>
            <span class="hint-tag" @click="form.dirPath = 'mods'">mods</span>
            <span class="hint-tag" @click="form.dirPath = 'Data'">Data</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="handleConfirm" :disabled="!canConfirm">
          ✓ 确认添加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import path from 'path'

const props = defineProps({
  game: Object
})

const emit = defineEmits(['close', 'confirm'])

const form = ref({
  alias: '',
  dirPath: ''
})

const fullPath = computed(() => {
  if (!form.value.dirPath.trim() || !props.game?.rootPath) return ''
  return `${props.game.rootPath}\\${form.value.dirPath.trim()}`
})

const canConfirm = computed(() => {
  return form.value.dirPath.trim()
})

const handleConfirm = () => {
  if (!canConfirm.value) return
  
  emit('confirm', {
    dirPath: form.value.dirPath.trim(),
    alias: form.value.alias.trim() || form.value.dirPath.trim()
  })
}
</script>

<style scoped>
.game-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.game-info-card .game-icon {
  font-size: 28px;
}

.game-info-card .game-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.game-info-card .game-root {
  font-size: 12px;
  color: var(--text-muted);
}

.path-hints {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.hint-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.hint-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hint-tag {
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.hint-tag:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
</style>