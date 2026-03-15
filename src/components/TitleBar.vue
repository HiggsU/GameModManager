<template>
  <header class="title-bar">
    <div class="title-bar-left">
      <span class="logo">🎮</span>
      <span class="title">Game Mod Manager</span>
      <span class="version">v1.0.0</span>
    </div>
    <div class="title-bar-controls">
      <button class="control-btn minimize" @click="minimize">─</button>
      <button class="control-btn maximize" @click="maximize">□</button>
      <button class="control-btn close" @click="close">✕</button>
    </div>
  </header>
</template>

<script setup>
const minimize = () => {
  window.electronAPI?.minimizeWindow()
}

const maximize = () => {
  window.electronAPI?.maximizeWindow()
}

const close = () => {
  window.electronAPI?.closeWindow()
}
</script>

<style scoped>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--bg-primary) 100%);
  -webkit-app-region: drag;
  border-bottom: 1px solid var(--border-color);
}

.title-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  -webkit-app-region: no-drag;
}

.logo {
  font-size: 20px;
  animation: float 3s ease-in-out infinite;
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.version {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--bg-card);
  border-radius: 10px;
  color: var(--text-muted);
}

.title-bar-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 36px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: var(--bg-hover);
}

.control-btn.close:hover {
  background: var(--danger);
  color: white;
}
</style>