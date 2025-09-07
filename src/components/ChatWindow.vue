<template>
  <div class="chat-container" :class="{ 'chat-open': isOpen }">
    <!-- Botón para abrir/cerrar el chat -->
    <button class="chat-toggle" @click="toggleChat">
      <span v-if="!isOpen">💬</span>
      <span v-else>✕</span>
    </button>

    <!-- Ventana del chat -->
    <div class="chat-window">
      <div class="chat-header">
        <h3>Chat de Proyectos Normativos del SII</h3>
        <p>¿En qué podemos ayudarte?</p>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{ 'user-message': message.isUser, 'bot-message': !message.isUser }"
        >
          <div class="message-content">
            {{ message.text }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <div class="chat-input">
        <input 
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Escribe tu mensaje..."
          :disabled="isTyping"
        />
        <button @click="sendMessage" :disabled="!newMessage.trim() || isTyping">
          <span v-if="!isTyping">📤</span>
          <span v-else>⏳</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const isOpen = ref(false)
const newMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

const messages = ref([
  {
    id: 1,
    text: '¡Hola! Bienvenido al chat de soporte del SII. ¿En qué puedo ayudarte hoy?',
    isUser: false,
    timestamp: new Date()
  }
])

let messageId = 2

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  // Agregar mensaje del usuario
  messages.value.push({
    id: messageId++,
    text: newMessage.value,
    isUser: true,
    timestamp: new Date()
  })

  const userMessage = newMessage.value
  newMessage.value = ''
  isTyping.value = true

  // Scroll al final
  await nextTick()
  scrollToBottom()

  // Simular respuesta del bot después de un delay
  setTimeout(() => {
    const botResponse = generateBotResponse(userMessage)
    messages.value.push({
      id: messageId++,
      text: botResponse,
      isUser: false,
      timestamp: new Date()
    })
    isTyping.value = false
    
    nextTick(() => {
      scrollToBottom()
    })
  }, 1500)
}

const generateBotResponse = (userMessage) => {
  const responses = [
    'Entiendo tu consulta. ¿Podrías proporcionarme más detalles?',
    'Gracias por contactarnos. Te ayudo con esa información.',
    'Esa es una excelente pregunta. Déjame buscar la información más actualizada.',
    'Para ayudarte mejor, ¿podrías especificar qué tipo de documento necesitas?',
    'Te recomiendo revisar la sección de normativas en nuestro sitio web oficial.',
    '¿Has intentado usar los filtros de búsqueda en la página principal?'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString('es-CL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  transition: all 0.3s ease;
}

.chat-toggle {
  position: absolute;
  right: 0;
  top: 0;
  width: 60px;
  height: 60px;
  background: #003366;
  color: white;
  border: none;
  border-radius: 0 50% 50% 0;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.chat-toggle:hover {
  background: #004080;
  transform: scale(1.05);
}

.chat-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 15px 0 0 15px;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.chat-open .chat-window {
  transform: translateX(0);
}

.chat-header {
  background: #003366;
  color: white;
  padding: 20px;
  border-radius: 15px 0 0 0;
  text-align: center;
}

.chat-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.chat-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
}

.bot-message {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.user-message .message-content {
  background: #003366;
  color: white;
  border-bottom-right-radius: 5px;
}

.bot-message .message-content {
  background: #f1f1f1;
  color: #333;
  border-bottom-left-radius: 5px;
}

.message-time {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  text-align: right;
}

.bot-message .message-time {
  text-align: left;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
}

.chat-input input:focus {
  border-color: #003366;
}

.chat-input button {
  width: 45px;
  height: 45px;
  background: #003366;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.chat-input button:hover:not(:disabled) {
  background: #004080;
}

.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Scrollbar personalizada */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #003366;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #004080;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-window {
    width: 300px;
    height: 450px;
  }
  
  .chat-toggle {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>
