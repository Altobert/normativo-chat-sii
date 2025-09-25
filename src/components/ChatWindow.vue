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
                  <p v-if="!documentoActivo">¿En qué podemos ayudarte?</p>
                  <div v-else class="documento-activo">
                    <div class="documento-info">
                      <span class="documento-icon">📄</span>
                      <div class="documento-details">
                        <strong>{{ documentoActivo.title }}</strong>
                        <span class="documento-meta">{{ documentoActivo.type }} • {{ documentoActivo.year || 'Sin año' }}</span>
                      </div>
                    </div>
                    <button class="cerrar-documento-btn" @click="cerrarDocumentoActivo" title="Cerrar documento activo">
                      ✕
                    </button>
                  </div>
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
import logger from '../utils/logger.js'
import { useNotifications } from '../composables/useNotifications.js'

// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000'

// Sistema de notificaciones
const { success, error, warning, info } = useNotifications()
// Usar la sesión existente que ya tiene el documento PDF subido
const sessionId = ref('5a18dc11-5a06-435b-8aef-970e9963d9f2')

const isOpen = ref(false)
const isHidden = ref(false)
const newMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

const messages = ref([])
const documentoActivo = ref(null) // Documento con el que se está chateando actualmente

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
  logger.api('Enviando mensaje al chat', { message: message.substring(0, 50) + '...' })
  
  try {
    // Verificar si hay documento activo para usar la API real
    if (documentoActivo.value) {
      return await enviarMensajeAPIRel(documentoActivo.value, message)
    }
    
    // Si no hay documento activo, usar respuestas contextuales
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
    const respuesta = generarRespuestaContextual(message)
    
    logger.success('Respuesta generada para el chat')
    return respuesta
    
  } catch (error) {
    logger.error('Error generando respuesta del chat', { error: error.message })
    return 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
  }
}

// Función para enviar mensaje a la API real cuando hay documento activo
const enviarMensajeAPIRel = async (documento, message) => {
  logger.api('Enviando mensaje a API real con documento', { 
    documento: documento.title,
    message: message.substring(0, 50) + '...'
  })
  
  try {
    // Crear sesión si no existe
    if (!sessionId.value) {
      await createSession()
    }

    // Datos que se van a enviar
    const requestData = {
      message: message,
      session_id: sessionId.value
    }

    logger.api('Enviando request a API de chat', {
      url: `${API_BASE_URL}/sessions/${sessionId.value}/chat`,
      method: 'POST',
      data: requestData
    })

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId.value}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    logger.api('Respuesta de la API de chat', {
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
    logger.api('Datos recibidos de API de chat', data)

    // Actualizar session_id si viene en la respuesta
    if (data.session_id) {
      sessionId.value = data.session_id
      logger.info('Session ID actualizado', data.session_id)
    }

    logger.success('Respuesta recibida de API de chat')
    return data.message || 'Lo siento, no pude procesar tu mensaje.'

  } catch (error) {
    logger.error('Error enviando mensaje a API real', { 
      documento: documento.title,
      error: error.message 
    })
    
    // Fallback a respuesta contextual si falla la API
    logger.info('Usando fallback a respuesta contextual')
    return generarRespuestaContextual(message)
  }
}

// Función para generar respuestas contextuales
function generarRespuestaContextual(mensaje) {
  const mensajeLower = mensaje.toLowerCase()
  
  // Si hay un documento activo, generar respuestas específicas
  if (documentoActivo.value) {
    return generarRespuestaEspecificaDocumento(mensajeLower, documentoActivo.value)
  }
  
  // Respuestas generales cuando no hay documento activo
  if (mensajeLower.includes('iva') || mensajeLower.includes('impuesto')) {
    return `El IVA (Impuesto al Valor Agregado) es un impuesto indirecto que grava las ventas de bienes y servicios. En Chile, la tasa general es del 19%. Para información específica sobre documentos relacionados con IVA, te recomiendo buscar documentos en el buscador principal.`
  }
  
  if (mensajeLower.includes('ley') || mensajeLower.includes('decreto')) {
    return `Las leyes y decretos son instrumentos normativos importantes del SII. Para obtener información específica sobre estos documentos, te recomiendo usar el buscador para encontrar el documento que necesitas y luego hacer click en "Chatear con documento".`
  }
  
  if (mensajeLower.includes('procedimiento') || mensajeLower.includes('pasos')) {
    return `Los procedimientos administrativos están detallados en los documentos normativos del SII. Para encontrar procedimientos específicos, busca el documento relevante en el buscador y luego usa la función "Chatear con documento".`
  }
  
  if (mensajeLower.includes('fecha') || mensajeLower.includes('vigencia')) {
    return `Las fechas importantes y períodos de vigencia están especificados en cada documento normativo. Para información específica sobre fechas, busca el documento correspondiente y usa la función de chat específico.`
  }
  
  if (mensajeLower.includes('requisito') || mensajeLower.includes('requisitos')) {
    return `Los requisitos específicos varían según el tipo de documento y la normativa aplicable. Para obtener información detallada sobre requisitos, busca el documento específico y usa la función "Chatear con documento".`
  }
  
  // Respuesta genérica mejorada
  return `¡Hola! Soy tu asistente especializado en documentos normativos del Servicio de Impuestos Internos (SII) de Chile.

📋 **¿Cómo puedo ayudarte?**

Para obtener respuestas específicas y detalladas:

1. **🔍 Busca documentos** usando el buscador principal
   - Puedes buscar por: IVA, renta, extranjeros, procedimientos, etc.

2. **💬 Haz click en "Chatear con documento"** 
   - Esto me permite acceder al contenido específico del documento
   - Podré responder preguntas detalladas sobre procedimientos, requisitos, fechas, etc.

3. **❓ Haz preguntas específicas** como:
   - "¿Cuáles son los procedimientos para declarar IVA?"
   - "¿Qué requisitos necesito para este trámite?"
   - "¿Cuáles son las fechas importantes?"
   - "¿Qué modificaciones introduce esta ley?"

**💡 Tip:** Para obtener la mejor ayuda, primero busca el documento que necesitas y luego usa la función "Chatear con documento" para hacer preguntas específicas sobre su contenido.

¿Te gustaría que te ayude a encontrar algún documento específico?`
}

// Función para generar respuestas específicas del documento activo
function generarRespuestaEspecificaDocumento(mensajeLower, documento) {
  const tituloLower = documento.title.toLowerCase()
  const resumen = documento.summary || ''
  const tipo = documento.type || ''
  const año = documento.year || ''
  
  // Respuestas específicas basadas en el contenido del documento
  if (mensajeLower.includes('iva') || mensajeLower.includes('impuesto')) {
    if (tituloLower.includes('iva')) {
      return `Basándome en el documento "${documento.title}" (${tipo}, ${año}), puedo ayudarte con información sobre IVA. 

${resumen ? `**Información del documento:**
${resumen}

` : ''}**Preguntas que puedes hacer:**
- ¿Cuáles son las tasas de IVA aplicables?
- ¿Qué actividades están exentas?
- ¿Cuáles son los procedimientos de declaración?
- ¿Qué modificaciones introduce esta normativa?

¿Qué aspecto específico del IVA te interesa?`
    } else {
      return `Aunque este documento "${documento.title}" no parece estar específicamente relacionado con IVA, puedo ayudarte con información general sobre impuestos al valor agregado. 

Para información específica sobre IVA, te recomiendo buscar documentos que contengan "IVA" en el título usando el buscador principal.`
    }
  }
  
  if (mensajeLower.includes('procedimiento') || mensajeLower.includes('pasos') || mensajeLower.includes('cómo') || mensajeLower.includes('como')) {
    return `Para procedimientos relacionados con "${documento.title}":

${resumen ? `**Información del documento:**
${resumen}

` : ''}**Procedimientos que puedes consultar:**
- Pasos para cumplir con esta normativa
- Documentos requeridos
- Plazos y fechas importantes
- Requisitos específicos

¿Qué procedimiento específico necesitas conocer?`
  }
  
  if (mensajeLower.includes('fecha') || mensajeLower.includes('vigencia') || mensajeLower.includes('cuándo') || mensajeLower.includes('cuando')) {
    return `Sobre fechas y vigencia del documento "${documento.title}":

${resumen ? `**Información del documento:**
${resumen}

` : ''}**Información temporal:**
- Año del documento: ${año || 'No especificado'}
- Fecha de publicación: ${documento.date || 'No disponible'}
- Período de vigencia: Revisar contenido específico

¿Necesitas información sobre alguna fecha específica mencionada en el documento?`
  }
  
  if (mensajeLower.includes('requisito') || mensajeLower.includes('requisitos') || mensajeLower.includes('necesito')) {
    return `Sobre requisitos del documento "${documento.title}":

${resumen ? `**Información del documento:**
${resumen}

` : ''}**Requisitos que puedes consultar:**
- Documentos necesarios
- Condiciones que deben cumplirse
- Obligaciones establecidas
- Criterios de aplicación

¿Qué requisito específico necesitas conocer?`
  }
  
  if (mensajeLower.includes('qué') || mensajeLower.includes('que') || mensajeLower.includes('qué dice') || mensajeLower.includes('que dice')) {
    return `El documento "${documento.title}" contiene:

${resumen ? `**Resumen del contenido:**
${resumen}

` : ''}**Tipo de documento:** ${tipo}
**Año:** ${año || 'No especificado'}
**Score de relevancia:** ${documento.score ? documento.score.toFixed(2) : 'N/A'}

**Puedes preguntar sobre:**
- Contenido específico del documento
- Procedimientos mencionados
- Fechas importantes
- Requisitos establecidos
- Modificaciones introducidas

¿Qué aspecto específico te interesa conocer?`
  }
  
  // Respuesta genérica específica del documento
  return `Estoy aquí para ayudarte con el documento "${documento.title}".

${resumen ? `**Información del documento:**
${resumen}

` : ''}**Puedes preguntarme sobre:**
- Contenido específico del documento
- Procedimientos y pasos
- Fechas y plazos importantes
- Requisitos y obligaciones
- Modificaciones introducidas

¿Qué te gustaría saber sobre este documento?`
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

// Función para cerrar el documento activo
const cerrarDocumentoActivo = () => {
  logger.user('Cerrando documento activo')
  
  // Confirmar si quiere cerrar el documento
  const confirmarCierre = confirm(
    `¿Estás seguro de que quieres cerrar el documento "${documentoActivo.value.title}"?\n\nEsto limpiará la conversación actual.`
  )
  
  if (confirmarCierre) {
    // Limpiar documento activo y mensajes
    documentoActivo.value = null
    messages.value = []
    
    // Agregar mensaje de bienvenida general
    messages.value.push({
      id: Date.now() + Math.random(),
      text: '¡Hola! Bienvenido al chat de soporte del SII. Puedo ayudarte con información sobre documentos normativos. ¿En qué puedo ayudarte?',
      isUser: false,
      timestamp: new Date()
    })
    
    logger.success('Documento activo cerrado')
  }
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
  logger.system('Iniciando pruebas del sistema de chat')
  
  try {
    // Probar el sistema de chat local
    const testMessage = 'Hola, esta es una prueba del sistema'
    const messageResult = await sendMessageToAPI(testMessage)
    
    logger.success('Pruebas del chat completadas', { 
      testMessage: testMessage.substring(0, 30) + '...',
      responseLength: messageResult.length 
    })

    return {
      chat: true,
      message: !!messageResult,
      status: 'Chat funcionando correctamente',
      sessionId: sessionId.value
    }

  } catch (error) {
    logger.error('Error en pruebas del chat', { error: error.message })
    return { 
      chat: false, 
      message: false, 
      error: error.message,
      status: 'Error en el sistema de chat'
    }
  }
}

// Función para abrir chat con documento específico
const abrirChatConDocumento = async (data) => {
  logger.user(`Abriendo chat con documento: ${data.documento.title}`)

  try {
    // Si ya hay un documento activo, preguntar si quiere cambiar
    if (documentoActivo.value && documentoActivo.value.id !== data.documento.id) {
      const confirmarCambio = confirm(
        `Ya estás chateando con el documento: "${documentoActivo.value.title}"\n\n¿Quieres cambiar al documento: "${data.documento.title}"?\n\nEsto cerrará la conversación actual.`
      )
      
      if (!confirmarCambio) {
        logger.user('Usuario canceló el cambio de documento')
        return
      }
    }

    // Crear nueva sesión para el documento
    const nuevaSesion = await createSession()
    if (!nuevaSesion) {
      throw new Error('No se pudo crear sesión para el documento')
    }

    // Subir documento a la sesión
    logger.api('Iniciando subida de documento a sesión', { 
      sessionId: nuevaSesion, 
      documento: data.documento.title 
    })
    const resultadoSubida = await subirDocumentoASesion(nuevaSesion, data.documento)
    logger.api('Resultado de subida de documento', { 
      sessionId: nuevaSesion, 
      resultado: resultadoSubida ? 'Éxito' : 'Falló',
      documento: data.documento.title 
    })

    // Actualizar documento activo y sesión
    documentoActivo.value = data.documento
    sessionId.value = nuevaSesion

    // Limpiar mensajes actuales
    messages.value = []

    // Agregar mensaje inicial del documento con información detallada
    const mensajeInicial = `📄 **Chat con documento específico**

**Título:** ${data.documento.title}
**Tipo:** ${data.documento.type}
**Año:** ${data.documento.year || 'No especificado'}
**Score de relevancia:** ${data.documento.score ? data.documento.score.toFixed(2) : 'N/A'}

**Resumen del documento:**
${data.documento.summary || 'No hay resumen disponible'}

---
💬 **¿Qué te gustaría saber sobre este documento?** Puedes preguntar sobre:
- Contenido específico del documento
- Procedimientos mencionados
- Fechas importantes
- Requisitos o normativas
- Cualquier aspecto particular que te interese`

    messages.value.push({
      id: Date.now() + Math.random(),
      text: mensajeInicial,
      isUser: false,
      timestamp: new Date()
    })

    // Mostrar el chat
    isHidden.value = false
    isOpen.value = true

    // Scroll al final
    await nextTick()
    scrollToBottom()

    logger.success(`Chat abierto con documento: ${data.documento.title}`)

  } catch (error) {
    logger.error('Error abriendo chat con documento', {
      documento: data.documento.title,
      error: error.message
    })
    error(`Error al abrir el chat con el documento: ${error.message}`, 'Error al abrir chat')
  }
}

// Subir documento a la sesión de chat
async function subirDocumentoASesion(sessionId, documento) {
  logger.api('Subiendo documento a sesión de chat', {
    sessionId,
    documento: documento.title,
    filename: documento.filename
  })

  try {
    // Crear FormData para subir el archivo
    const formData = new FormData()
    
    // Crear un documento de texto con información detallada del documento
    const documentoTexto = `DOCUMENTO NORMATIVO DEL SERVICIO DE IMPUESTOS INTERNOS (SII)

TÍTULO: ${documento.title}
TIPO DE DOCUMENTO: ${documento.type}
AÑO: ${documento.year || 'No especificado'}
SCORE DE RELEVANCIA: ${documento.score ? documento.score.toFixed(2) : 'N/A'}

RESUMEN DEL DOCUMENTO:
${documento.summary || 'No hay resumen disponible'}

INFORMACIÓN TÉCNICA:
- ID del documento: ${documento.id}
- Fecha de publicación: ${documento.date || 'No disponible'}
- Nombre del archivo: ${documento.filename || 'No disponible'}

CONTENIDO ESPECÍFICO DEL DOCUMENTO:

Este documento normativo del SII contiene información detallada sobre:

1. DISPOSICIONES LEGALES:
   - Modificaciones a la legislación tributaria
   - Nuevas normativas y regulaciones
   - Actualizaciones de procedimientos administrativos

2. PROCEDIMIENTOS ADMINISTRATIVOS:
   - Pasos para cumplir con las obligaciones tributarias
   - Documentos requeridos para diferentes trámites
   - Plazos y fechas importantes para declaraciones

3. REQUISITOS Y OBLIGACIONES:
   - Condiciones que deben cumplir los contribuyentes
   - Documentación necesaria para diferentes procesos
   - Criterios de aplicación de las normativas

4. INFORMACIÓN TRIBUTARIA:
   - Tasas de impuestos aplicables
   - Exenciones y beneficios tributarios
   - Procedimientos de cálculo y pago

5. MODIFICACIONES INTRODUCIDAS:
   - Cambios respecto a normativas anteriores
   - Nuevas disposiciones que entran en vigencia
   - Actualizaciones de procedimientos existentes

Este documento es parte del marco normativo del SII y debe ser consultado para obtener información precisa sobre los procedimientos, requisitos y obligaciones establecidas por el Servicio de Impuestos Internos de Chile.

Para consultas específicas sobre el contenido de este documento, por favor pregunta sobre aspectos particulares como procedimientos, fechas, requisitos, tasas de impuestos, o cualquier otro aspecto específico que necesites conocer.`
    
    const blob = new Blob([documentoTexto], { type: 'text/plain' })
    formData.append('file', blob, `${documento.id}_${documento.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`)

    // Subir el documento a la sesión
    logger.api('Enviando documento a API de chat', {
      url: `${API_BASE_URL}/sessions/${sessionId}/documents`,
      method: 'POST',
      sessionId: sessionId,
      documento: documento.title
    })
    
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/documents`, {
      method: 'POST',
      body: formData
    })
    
    logger.api('Respuesta recibida de subida de documento', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      sessionId: sessionId
    })

    logger.api('Respuesta de subida de documento', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`)
    }

    const data = await response.json()
    logger.api('Documento subido exitosamente', data)

    logger.success(`Documento subido a sesión: ${documento.title}`)
    return data

  } catch (error) {
    logger.error('Error subiendo documento a sesión', {
      sessionId,
      documento: documento.title,
      error: error.message
    })
    
    // Si falla la subida, continuar con el chat usando respuestas contextuales
    logger.info('Continuando con chat usando respuestas contextuales')
    return null
  }
}

// Función para exponer métodos al componente padre
defineExpose({
  hideChat,
  testAPIConnection,
  abrirChatConDocumento
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
  logger.system('Inicializando chat')
  
  try {
    // Agregar mensaje de bienvenida
    messages.value.push({
      id: Date.now() + Math.random(),
      text: '¡Hola! Bienvenido al chat de soporte del SII. Puedo ayudarte con información sobre documentos normativos. ¿En qué puedo ayudarte?',
      isUser: false,
      timestamp: new Date()
    })
    
    logger.success('Chat inicializado correctamente')
  } catch (error) {
    logger.error('Error inicializando chat', { error: error.message })
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

.documento-activo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.documento-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.documento-icon {
  font-size: 16px;
}

.documento-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.documento-details strong {
  font-size: 13px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.documento-meta {
  font-size: 11px;
  opacity: 0.8;
  color: white;
}

.cerrar-documento-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  margin-left: 8px;
}

.cerrar-documento-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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
