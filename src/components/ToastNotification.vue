<template>
  <div v-if="visible" class="toast-notification" :class="typeClass">
    <div class="toast-content">
      <div class="toast-icon">
        <span v-if="type === 'success'">✅</span>
        <span v-else-if="type === 'error'">❌</span>
        <span v-else-if="type === 'warning'">⚠️</span>
        <span v-else-if="type === 'info'">ℹ️</span>
        <span v-else>📢</span>
      </div>
      <div class="toast-message">
        <h4 v-if="title" class="toast-title">{{ title }}</h4>
        <p class="toast-text">{{ message }}</p>
      </div>
      <button @click="close" class="toast-close" aria-label="Cerrar notificación">
        ✕
      </button>
    </div>
    <div class="toast-progress" :style="{ animationDuration: duration + 'ms' }"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 5000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)
let timeoutId = null

const typeClass = computed(() => `toast-${props.type}`)

const close = () => {
  visible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  setTimeout(() => {
    emit('close')
  }, 300) // Tiempo para la animación de salida
}

onMounted(() => {
  if (props.autoClose && props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 320px;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-left: 4px solid;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.toast-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #4b5563;
}

.toast-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.toast-progress {
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1));
  border-radius: 0 0 12px 12px;
  animation: progress linear;
}

.toast-success .toast-progress {
  background: linear-gradient(90deg, #10b981, transparent);
}

.toast-error .toast-progress {
  background: linear-gradient(90deg, #ef4444, transparent);
}

.toast-warning .toast-progress {
  background: linear-gradient(90deg, #f59e0b, transparent);
}

.toast-info .toast-progress {
  background: linear-gradient(90deg, #3b82f6, transparent);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .toast-notification {
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }
}
</style>
