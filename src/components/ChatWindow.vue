<template>
  <div class="chat-container" :class="{ 'chat-open': isOpen, 'chat-hidden': isHidden }">
    <!-- Botón para abrir/cerrar/mostrar el chat - siempre visible -->
    <button class="chat-toggle" @click="isHidden ? showChat() : toggleChat()">
      <span v-if="!isOpen && !isHidden">💬</span>
      <span v-else-if="isOpen && !isHidden">✕</span>
      <span v-else-if="isHidden">💬</span>
    </button>

    <!-- Ventana del chat -->
    <div class="chat-window">
      <div class="chat-header">
        <div class="header-content">
          <div class="header-text">
            <h3>Chat de Proyectos Normativos del SII</h3>
            <p>¿En qué podemos ayudarte?</p>
          </div>
          <button class="test-btn" @click="runTests" title="Probar conexión con API">
            🧪
          </button>
        </div>
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
          <div v-if="message.thinking && !message.isUser" class="message-thinking">
            💭 {{ message.thinking }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
        
        <!-- Indicador de pensamiento del bot -->
        <div v-if="isTyping" class="message bot-message typing-indicator">
          <div class="message-content">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">El asistente está pensando...</span>
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

// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000'
// Usar la sesión existente que ya tiene el documento PDF subido
const sessionId = ref('fe38e894-5d52-4e9c-b11f-3edeed4f063d')

const isOpen = ref(false)
const isHidden = ref(false)
const newMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

const messages = ref([])

// Funciones para manejar la API
const createSession = async () => {
  console.log('🆕 Creando nueva sesión...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('📡 Respuesta creación de sesión:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('📥 Datos de sesión recibidos:', data)
    
    sessionId.value = data.session_id || data.id
    console.log('✅ Session ID asignado:', sessionId.value)
    
    return sessionId.value
  } catch (error) {
    console.error('❌ Error creando sesión:', error)
    return null
  }
}

const sendMessageToAPI = async (message) => {
  if (!sessionId.value) {
    await createSession()
  }
  
  // Datos que se van a enviar
  const requestData = {
    message: message,
    session_id: sessionId.value
  }
  
  console.log('🚀 Enviando mensaje a la API:', {
    url: `${API_BASE_URL}/sessions/${sessionId.value}/chat`,
    method: 'POST',
    data: requestData
  })
  
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId.value}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    
    console.log('📡 Respuesta de la API:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
    
    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json()
        if (errorData.detail && errorData.detail.includes('documentos')) {
          throw new Error('No hay documentos cargados. Suba al menos un documento antes de chatear.')
        }
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('📥 Datos recibidos:', data)
    
    // Actualizar session_id si viene en la respuesta
    if (data.session_id) {
      sessionId.value = data.session_id
      console.log('🔄 Session ID actualizado:', data.session_id)
    }
    
    return data.message || 'Lo siento, no pude procesar tu mensaje.'
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error)
    return 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
  }
}

const loadMessageHistory = async () => {
  if (!sessionId.value) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId.value}/messages`)
    
    if (!response.ok) {
      throw new Error('Error al cargar historial')
    }
    
    const data = await response.json()
    if (data.messages && Array.isArray(data.messages)) {
      messages.value = data.messages.map(msg => ({
        id: msg.id || Date.now() + Math.random(),
        text: msg.message || msg.content || msg.text,
        isUser: msg.role === 'user' || msg.is_user || false,
        timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
        thinking: msg.thinking || null // Campo opcional para el pensamiento del bot
      }))
    }
  } catch (error) {
    console.error('Error cargando historial:', error)
  }
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const hideChat = () => {
  isHidden.value = true
  isOpen.value = false
}

const showChat = () => {
  isHidden.value = false
}

// Función para ejecutar las pruebas
const runTests = async () => {
  console.log('🚀 Ejecutando pruebas de API...')
  const result = await testAPIConnection()
  
  // Mostrar resultado en el chat
  messages.value.push({
    id: Date.now() + Math.random(),
    text: `🧪 Resultado de pruebas: ${JSON.stringify(result, null, 2)}`,
    isUser: false,
    timestamp: new Date()
  })
  
  await nextTick()
  scrollToBottom()
}

// Función de prueba para verificar la conexión con la API
const testAPIConnection = async () => {
  console.log('🧪 Iniciando prueba de conexión con la API...')
  
  try {
    // Probar health check
    console.log('🔍 Probando health check...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    console.log('💚 Health check:', {
      status: healthResponse.status,
      ok: healthResponse.ok
    })
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('📊 Health data:', healthData)
    }
    
    // Probar creación de sesión
    console.log('🆕 Probando creación de sesión...')
    const sessionResult = await createSession()
    
    if (sessionResult) {
      console.log('✅ Prueba de sesión exitosa')
      
      // Probar envío de mensaje
      console.log('💬 Probando envío de mensaje...')
      const testMessage = 'Hola, esta es una prueba'
      const messageResult = await sendMessageToAPI(testMessage)
      console.log('📝 Respuesta de prueba:', messageResult)
      
      return {
        health: healthResponse.ok,
        session: !!sessionResult,
        message: !!messageResult,
        sessionId: sessionResult
      }
    } else {
      console.log('❌ Error en prueba de sesión')
      return { health: healthResponse.ok, session: false, message: false }
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de conexión:', error)
    return { health: false, session: false, message: false, error: error.message }
  }
}

// Función para exponer hideChat al componente padre
defineExpose({
  hideChat,
  testAPIConnection
})

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  // Agregar mensaje del usuario
  const userMessage = {
    id: Date.now() + Math.random(),
    text: newMessage.value,
    isUser: true,
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)
  const messageText = newMessage.value
  newMessage.value = ''
  
  // Activar indicador de pensamiento
  isTyping.value = true

  // Scroll al final para mostrar el indicador
  await nextTick()
  scrollToBottom()

  try {
    console.log('🤔 Enviando mensaje y esperando respuesta...')
    
    // Enviar mensaje a la API
    const botResponse = await sendMessageToAPI(messageText)
    
    console.log('✅ Respuesta recibida:', botResponse)
    
    // Agregar respuesta del bot
    messages.value.push({
      id: Date.now() + Math.random(),
      text: botResponse,
      isUser: false,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('❌ Error en respuesta:', error)
    
    // En caso de error, mostrar mensaje de fallback
    messages.value.push({
      id: Date.now() + Math.random(),
      text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
      isUser: false,
      timestamp: new Date()
    })
  } finally {
    // Desactivar indicador de pensamiento
    isTyping.value = false
    await nextTick()
    scrollToBottom()
  }
}

// Inicializar sesión al montar el componente
const initializeChat = async () => {
  try {
    // Verificar que la sesión existe y cargar historial si hay mensajes
    await loadMessageHistory()
    
    // Agregar mensaje de bienvenida
    messages.value.push({
      id: Date.now() + Math.random(),
      text: '¡Hola! Bienvenido al chat de soporte del SII. Tengo disponible el documento "ID041_Ley_20_899_Modifica_Ley_IVA.pdf". ¿En qué puedo ayudarte?',
      isUser: false,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error inicializando chat:', error)
    // Mensaje de bienvenida de fallback
    messages.value.push({
      id: Date.now() + Math.random(),
      text: '¡Hola! Bienvenido al chat de soporte del SII. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    })
  }
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

onMounted(async () => {
  await initializeChat()
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.chat-toggle {
  width: 60px;
  height: 60px;
  background: #003366;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.chat-toggle:hover {
  background: #004080;
  transform: scale(1.05);
}

.chat-hidden .chat-window {
  display: none;
}

.chat-window {
  position: absolute;
  top: 80px;
  right: 0;
  width: 420px;
  height: 600px;
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
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text {
  text-align: center;
  flex: 1;
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

.test-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  margin-left: 10px;
}

.test-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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

.message-thinking {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(0, 51, 102, 0.1);
  border-radius: 8px;
  border-left: 3px solid #003366;
}

.typing-indicator {
  opacity: 0.8;
}

.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #003366;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 14px;
  color: #666;
  font-style: italic;
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
  .chat-container {
    right: 15px;
    top: 15px;
  }
  
  .chat-window {
    width: 350px;
    height: 500px;
    top: 70px;
  }
  
  .chat-toggle {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>
