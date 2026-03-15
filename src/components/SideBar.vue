<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>📁 游戏列表</h2>
    </div>
    
    <div class="game-list">
      <div
        v-for="game in games"
        :key="game.id"
        class="game-item"
        :class="{ active: game.id === activeGameId }"
        @click="$emit('select', game.id)"
      >
        <div class="game-icon">🎯</div>
        <div class="game-info">
          <div class="game-name">{{ game.name }}</div>
          <div class="game-mod-count">{{ game.mods?.length || 0 }} 个Mod</div>
        </div>
      </div>
      
      <div v-if="games.length === 0" class="empty-games">
        <span>还没有游戏哦~</span>
      </div>
    </div>
    
    <button class="add-game-btn" @click="$emit('add')">
      <span class="icon">➕</span>
      <span>添加游戏</span>
    </button>
  </aside>
</template>

<script setup>
defineProps({
  games: Array,
  activeGameId: String
})

defineEmits(['select', 'add'])
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-secondary);
}

.game-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}

.game-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}

.game-item.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-color: var(--primary-light);
  box-shadow: var(--shadow-glow);
}

.game-icon {
  font-size: 28px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.game-item.active .game-icon {
  background: rgba(255, 255, 255, 0.2);
}

.game-info {
  flex: 1;
  min-width: 0;
}

.game-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-mod-count {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.empty-games {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.add-game-btn {
  margin: 12px;
  padding: 14px;
  background: linear-gradient(135deg, var(--secondary) 0%, #00b894 100%);
  border: none;
  border-radius: var(--radius-md);
  color: var(--bg-primary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: var(--transition);
}

.add-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 206, 201, 0.4);
}

.add-game-btn .icon {
  font-size: 18px;
}
</style>