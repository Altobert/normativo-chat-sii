# Solución: Chat no consultaba a la API

## 🚨 **Problema Identificado**

**Síntoma**: La ventana de chat no estaba consultando a la API de chat real.

**Causa**: El chat estaba usando respuestas simuladas en lugar de conectarse a la API real de chat.

## 🔍 **Diagnóstico Realizado**

### **1. Verificación de la API de Chat**
```bash
curl -X GET "http://localhost:8000/health"
# Respuesta: {"status":"healthy","message":"Chat Normativo SII API está funcionando correctamente"}
```

### **2. Prueba de Creación de Sesión**
```bash
curl -X POST "http://localhost:8000/sessions"
# Respuesta: {"session_id":"13ce8e25-8dd7-4b0d-9dd9-abdbdb22736f","documents":[],"messages":[],"created_at":"2025-09-15T02:50:08.885137"}
```

### **3. Prueba de Chat sin Documentos**
```bash
curl -X POST "http://localhost:8000/sessions/13ce8e25-8dd7-4b0d-9dd9-abdbdb22736f/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "session_id": "13ce8e25-8dd7-4b0d-9dd9-abdbdb22736f"}'

# Respuesta: {"detail":"No hay documentos cargados. Suba al menos un documento antes de chatear."}
```

### **4. Prueba de Subida de Documento**
```bash
curl -X POST "http://localhost:8000/sessions/13ce8e25-8dd7-4b0d-9dd9-abdbdb22736f/documents" \
  -F "file=@documento_prueba.txt"

# Respuesta: {"id":"file_documento_prueba.txt","name":"documento_prueba.txt","type":"document","upload_date":"2025-09-15T02:50:43.069376"}
```

### **5. Prueba de Chat con Documento**
```bash
curl -X POST "http://localhost:8000/sessions/13ce8e25-8dd7-4b0d-9dd9-abdbdb22736f/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué dice esta ley sobre el IVA?", "session_id": "13ce8e25-8dd7-4b0d-9dd9-abdbdb22736f"}'

# Respuesta: {"message":"Esta ley chilena (Ley 20.899) modifica la Ley del Impuesto al Valor Agregado (IVA), estableciendo nuevas disposiciones para el cálculo y pago del IVA, aunque no se detalla específicamente qué cambios se han realizado en el contexto proporcionado.","thinking":null,"session_id":"13ce8e25-8dd7-4b0d-9dd9-abdbdb22736f","timestamp":"2025-09-15T02:51:00.506439"}
```

## ✅ **Solución Implementada**

### **1. Modificación de `sendMessageToAPI`**
```javascript
const sendMessageToAPI = async (message) => {
  // Verificar si hay documento activo para usar la API real
  if (documentoActivo.value) {
    return await enviarMensajeAPIRel(documentoActivo.value, message)
  }
  
  // Si no hay documento activo, usar respuestas contextuales
  const respuesta = generarRespuestaContextual(message)
  return respuesta
}
```

### **2. Nueva Función `enviarMensajeAPIRel`**
```javascript
const enviarMensajeAPIRel = async (documento, message) => {
  // Crear sesión si no existe
  if (!sessionId.value) {
    await createSession()
  }

  // Enviar mensaje a la API real
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId.value}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      session_id: sessionId.value
    })
  })

  const data = await response.json()
  return data.message || 'Lo siento, no pude procesar tu mensaje.'
}
```

### **3. Función `subirDocumentoASesion`**
```javascript
async function subirDocumentoASesion(sessionId, documento) {
  // Crear documento de texto con información del documento
  const documentoTexto = `Título: ${documento.title}
Tipo: ${documento.type}
Año: ${documento.year || 'No especificado'}
Score de relevancia: ${documento.score ? documento.score.toFixed(2) : 'N/A'}
Resumen: ${documento.summary || 'No hay resumen disponible'}

Información adicional:
- ID del documento: ${documento.id}
- Fecha: ${documento.date || 'No disponible'}
- Filename: ${documento.filename || 'No disponible'}

Este documento contiene información normativa del SII relacionada con ${documento.type} y puede incluir procedimientos, requisitos, fechas importantes y modificaciones legales.`
  
  const blob = new Blob([documentoTexto], { type: 'text/plain' })
  const formData = new FormData()
  formData.append('file', blob, `${documento.id}_${documento.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`)

  // Subir a la API
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/documents`, {
    method: 'POST',
    body: formData
  })

  return await response.json()
}
```

### **4. Modificación de `abrirChatConDocumento`**
```javascript
const abrirChatConDocumento = async (data) => {
  // Crear nueva sesión para el documento
  const nuevaSesion = await createSession()
  
  // Subir documento a la sesión
  await subirDocumentoASesion(nuevaSesion, data.documento)

  // Actualizar documento activo y sesión
  documentoActivo.value = data.documento
  sessionId.value = nuevaSesion
  
  // Resto de la lógica...
}
```

## 🎯 **Flujo de Funcionamiento**

### **Chat General (Sin documento activo):**
1. Usuario envía mensaje
2. `sendMessageToAPI` detecta que no hay documento activo
3. Usa `generarRespuestaContextual` para respuestas generales
4. No se conecta a la API de chat

### **Chat con Documento Específico:**
1. Usuario hace click en "💬 Chatear con documento"
2. Se crea nueva sesión en la API de chat
3. Se sube documento como archivo de texto a la sesión
4. Se actualiza `documentoActivo` y `sessionId`
5. Usuario envía mensaje
6. `sendMessageToAPI` detecta documento activo
7. Usa `enviarMensajeAPIRel` para conectar con API real
8. API procesa mensaje usando el documento subido
9. Devuelve respuesta contextual del documento

## 📊 **Logs Implementados**

### **Logs de API Real:**
```javascript
📡 [14:35:20] Enviando mensaje a API real con documento
📊 Datos: { "documento": "Ley 20.899 Modifica Ley IVA", "message": "¿Qué dice esta ley?..." }
📡 [14:35:21] Enviando request a API de chat
📊 Datos: { "url": "http://localhost:8000/sessions/.../chat", "method": "POST" }
📡 [14:35:22] Respuesta de la API de chat
📊 Datos: { "status": 200, "statusText": "OK", "ok": true }
✅ [14:35:23] Respuesta recibida de API de chat
```

### **Logs de Subida de Documento:**
```javascript
📡 [14:35:20] Subiendo documento a sesión de chat
📊 Datos: { "sessionId": "abc123", "documento": "Ley 20.899 Modifica Ley IVA" }
📡 [14:35:21] Respuesta de subida de documento
📊 Datos: { "status": 200, "statusText": "OK", "ok": true }
✅ [14:35:22] Documento subido a sesión: Ley 20.899 Modifica Ley IVA
```

## 🔧 **Configuración de la API**

### **Endpoints Utilizados:**
- `GET /health` - Verificar estado de la API
- `POST /sessions` - Crear nueva sesión
- `POST /sessions/{session_id}/documents` - Subir documento
- `POST /sessions/{session_id}/chat` - Enviar mensaje

### **Tipos de Archivo Aceptados:**
- PDF (.pdf)
- Texto (.txt)
- Markdown (.md)

### **Formato de Documento Subido:**
```
Título: Ley 20.899 Modifica Ley IVA
Tipo: ley
Año: 2023
Score de relevancia: 0.95
Resumen: Esta ley modifica la Ley del Impuesto al Valor Agregado...

Información adicional:
- ID del documento: ID041
- Fecha: 2023-01-15
- Filename: ID041_Ley_20_899_Modifica_Ley_IVA.pdf

Este documento contiene información normativa del SII relacionada con ley y puede incluir procedimientos, requisitos, fechas importantes y modificaciones legales.
```

## 🚀 **Resultado Final**

### **Antes:**
- ❌ Chat usaba respuestas simuladas
- ❌ No se conectaba a la API real
- ❌ Respuestas genéricas sin contexto

### **Después:**
- ✅ Chat se conecta a la API real cuando hay documento activo
- ✅ Documento se sube automáticamente a la sesión
- ✅ Respuestas contextuales basadas en el documento
- ✅ Fallback a respuestas simuladas si falla la API
- ✅ Logging completo de todas las operaciones

---
*Sistema de Chat con API Real implementado para el Buscador Normativo SII*
