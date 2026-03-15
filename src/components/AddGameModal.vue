<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">🎮 添加新游戏</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">游戏名称</label>
          <input 
            type="text" 
            class="input" 
            v-model="form.name"
            placeholder="输入游戏名称，如：Minecraft"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">游戏根目录</label>
          <div class="input-group">
            <input 
              type="text" 
              class="input" 
              v-model="form.rootPath"
              placeholder="选择或输入游戏安装目录"
              readonly
            />
            <button class="btn btn-secondary" @click="selectPath">浏览</button>
          </div>
          <div class="form-hint">选择游戏的安装根目录，Mod目录将相对于此路径配置</div>
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

const emit = defineEmits(['close', 'confirm'])

const form = ref({
  name: '',
  rootPath: ''
})

const canConfirm = computed(() => {
  return form.value.name.trim() && form.value.rootPath.trim()
})

const selectPath = async () => {
  const path = await window.electronAPI?.selectDirectory()
  if (path) {
    form.value.rootPath = path
  }
}

const handleConfirm = () => {
  if (!canConfirm.value) return
  
  emit('confirm', {
    name: form.value.name.trim(),
    rootPath: form.value.rootPath.trim()
  })
}
</script>

<style scoped>
/* 样式继承自 main.css */
</style>