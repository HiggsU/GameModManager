<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <div class="welcome-icon animate-float">🎮</div>
      <h1 class="welcome-title">欢迎来到 Game Mod Manager</h1>
      <p class="welcome-desc">轻松管理你的游戏Mod，一键安装、备份和还原！</p>
      
      <div class="feature-cards">
        <div class="feature-card">
          <div class="feature-icon">📁</div>
          <div class="feature-title">游戏管理</div>
          <div class="feature-desc">添加多个游戏，配置Mod目录</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <div class="feature-title">拖拽安装</div>
          <div class="feature-desc">直接拖拽文件即可安装Mod</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <div class="feature-title">自动备份</div>
          <div class="feature-desc">自动备份原文件，安全无忧</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <div class="feature-title">一键还原</div>
          <div class="feature-desc">随时还原到安装前的状态</div>
        </div>
      </div>
      
      <button class="start-btn" @click="$emit('add-game')">
        <span>🚀</span>
        <span>开始添加游戏</span>
      </button>
    </div>
    
    <div class="decoration">
      <div class="floating-emoji e1">🎲</div>
      <div class="floating-emoji e2">🕹️</div>
      <div class="floating-emoji e3">🎪</div>
      <div class="floating-emoji e4">🎨</div>
      <div class="floating-emoji e5">🎭</div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['add-game'])
</script>

<style scoped>
.welcome-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.welcome-content {
  text-align: center;
  max-width: 700px;
  padding: 40px;
  z-index: 1;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-desc {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px 16px;
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
  box-shadow: var(--shadow-glow);
}

.feature-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.feature-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.feature-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.start-btn {
  padding: 18px 48px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border: none;
  border-radius: var(--radius-xl);
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: var(--transition);
  font-family: inherit;
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(108, 92, 231, 0.6);
}

.decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.floating-emoji {
  position: absolute;
  font-size: 32px;
  opacity: 0.15;
  animation: float 4s ease-in-out infinite;
}

.e1 { top: 10%; left: 10%; animation-delay: 0s; }
.e2 { top: 20%; right: 15%; animation-delay: 0.5s; }
.e3 { bottom: 30%; left: 8%; animation-delay: 1s; }
.e4 { bottom: 15%; right: 10%; animation-delay: 1.5s; }
.e5 { top: 50%; right: 5%; animation-delay: 2s; }
</style>