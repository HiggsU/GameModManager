<template>
  <div class="app-container">
    <!-- 自定义标题栏 -->
    <TitleBar />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <SideBar :games="games" :activeGameId="activeGameId" @select="selectGame" @add="showAddGameModal = true" />
      
      <div class="content-area">
        <template v-if="activeGame">
          <GameDetail 
            :game="activeGame" 
            @delete="deleteGame"
            @add-directory="showAddDirModal = true"
            @delete-directory="deleteDirectory"
            @add-mods="handleAddMods"
            @restore-mod="restoreMod"
            @restore-batch="restoreBatch"
            @restore-all="restoreAll"
          />
        </template>
        <template v-else>
          <WelcomePage @add-game="showAddGameModal = true" />
        </template>
      </div>
    </main>
    
    <!-- 添加游戏弹窗 -->
    <AddGameModal 
      v-if="showAddGameModal" 
      @close="showAddGameModal = false"
      @confirm="addGame"
    />
    
    <!-- 添加目录弹窗 -->
    <AddDirectoryModal 
      v-if="showAddDirModal && activeGame"
      :game="activeGame"
      @close="showAddDirModal = false"
      @confirm="addDirectory"
    />
    
    <!-- 消息提示 -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TitleBar from './components/TitleBar.vue'
import SideBar from './components/SideBar.vue'
import GameDetail from './components/GameDetail.vue'
import WelcomePage from './components/WelcomePage.vue'
import AddGameModal from './components/AddGameModal.vue'
import AddDirectoryModal from './components/AddDirectoryModal.vue'
import Toast from './components/Toast.vue'

const games = ref([])
const activeGameId = ref(null)
const showAddGameModal = ref(false)
const showAddDirModal = ref(false)
const toastRef = ref(null)

const activeGame = computed(() => {
  return games.value.find(g => g.id === activeGameId.value)
})

const loadGames = async () => {
  try {
    games.value = await window.electronAPI.getGames()
  } catch (e) {
    console.error('加载游戏列表失败:', e)
  }
}

const selectGame = (gameId) => {
  activeGameId.value = gameId
}

const addGame = async (gameData) => {
  try {
    const newGame = await window.electronAPI.addGame(gameData)
    games.value.push(newGame)
    activeGameId.value = newGame.id
    showAddGameModal.value = false
    toastRef.value?.show('游戏添加成功！🎮', 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

const deleteGame = async (gameId) => {
  if (!confirm('确定要删除这个游戏吗？此操作不会删除备份文件。')) return
  
  try {
    await window.electronAPI.deleteGame(gameId)
    games.value = games.value.filter(g => g.id !== gameId)
    if (activeGameId.value === gameId) {
      activeGameId.value = null
    }
    toastRef.value?.show('游戏已删除', 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

const addDirectory = async (data) => {
  try {
    const newDir = await window.electronAPI.addDirectory({
      gameId: activeGameId.value,
      ...data
    })
    const game = games.value.find(g => g.id === activeGameId.value)
    if (game) {
      game.directories.push(newDir)
    }
    showAddDirModal.value = false
    toastRef.value?.show('目录配置添加成功！', 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

const deleteDirectory = async (dirId) => {
  if (!confirm('确定要删除这个目录配置吗？')) return
  
  try {
    await window.electronAPI.deleteDirectory({
      gameId: activeGameId.value,
      dirId
    })
    const game = games.value.find(g => g.id === activeGameId.value)
    if (game) {
      game.directories = game.directories.filter(d => d.id !== dirId)
    }
    toastRef.value?.show('目录配置已删除', 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

const handleAddMods = async ({ dirId, files }) => {
  try {
    const result = await window.electronAPI.addModFiles({
      gameId: activeGameId.value,
      dirId,
      files
    })
    // 刷新游戏数据
    await loadGames()
    toastRef.value?.show(`成功添加 ${result.records.length} 个Mod文件！`, 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

const restoreMod = async (modId) => {
  if (!confirm('确定要还原这个Mod吗？')) return
  
  try {
    await window.electronAPI.restoreMod({
      gameId: activeGameId.value,
      modId
    })
    await loadGames()
    toastRef.value?.show('Mod已还原', 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

const restoreBatch = async (batchId) => {
  if (!confirm('确定要还原这批Mod吗？')) return
  
  try {
    await window.electronAPI.restoreBatch({
      gameId: activeGameId.value,
      batchId
    })
    await loadGames()
    toastRef.value?.show('批量还原成功', 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

const restoreAll = async () => {
  if (!confirm('⚠️ 确定要还原所有Mod吗？这将移除所有添加的Mod文件！')) return
  
  try {
    await window.electronAPI.restoreAll(activeGameId.value)
    await loadGames()
    toastRef.value?.show('已还原所有Mod！', 'success')
  } catch (e) {
    toastRef.value?.show(e.message, 'error')
  }
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg-secondary);
}
</style>