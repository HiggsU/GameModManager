<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="type">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('success')
let timer = null

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type.value] || 'ℹ'
})

const show = (msg, tp = 'success') => {
  message.value = msg
  type.value = tp
  visible.value = true
  
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, 3000)
}

defineExpose({ show })
</script>

<style scoped>
.toast {
  position: fixed;
  top: 60px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-heavy);
  z-index: 2000;
  border-left: 4px solid;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  border-color: var(--success);
}

.toast.error {
  border-color: var(--danger);
}

.toast.warning {
  border-color: var(--warning);
}

.toast.info {
  border-color: var(--secondary);
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.toast.success .toast-icon {
  background: var(--success);
  color: var(--bg-primary);
}

.toast.error .toast-icon {
  background: var(--danger);
  color: white;
}

.toast.warning .toast-icon {
  background: var(--warning);
  color: var(--bg-primary);
}

.toast.info .toast-icon {
  background: var(--secondary);
  color: var(--bg-primary);
}

.toast-message {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>