import { ref } from 'vue'

// Estado global para las notificaciones
const notifications = ref([])

export function useNotifications() {
  const addNotification = (message, options = {}) => {
    const id = Date.now() + Math.random()
    const notification = {
      id,
      message,
      title: options.title || '',
      type: options.type || 'info',
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false
    }
    
    notifications.value.push(notification)
    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Métodos de conveniencia
  const success = (message, title = 'Éxito') => {
    return addNotification(message, { type: 'success', title })
  }

  const error = (message, title = 'Error') => {
    return addNotification(message, { type: 'error', title })
  }

  const warning = (message, title = 'Advertencia') => {
    return addNotification(message, { type: 'warning', title })
  }

  const info = (message, title = 'Información') => {
    return addNotification(message, { type: 'info', title })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
