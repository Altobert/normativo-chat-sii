<template>
  <div class="notifications-container">
    <ToastNotification
      v-for="notification in notifications"
      :key="notification.id"
      :message="notification.message"
      :title="notification.title"
      :type="notification.type"
      :duration="notification.duration"
      :auto-close="notification.autoClose"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup>
import { useNotifications } from '../composables/useNotifications.js'
import ToastNotification from './ToastNotification.vue'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;
}

.notifications-container > * {
  pointer-events: auto;
  margin-bottom: 10px;
}
</style>
