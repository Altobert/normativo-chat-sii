# Error: Sesión Expirada - Documentación

## 📋 Descripción del Error

**Fecha:** 14 de Septiembre, 2025  
**Error:** Sesión no encontrada (404 Not Found)  
**Componente:** ChatWindow.vue  
**API Endpoint:** `/sessions/{session_id}`  

## 🔍 Síntomas

- El chat muestra el mensaje: "Lo siento, hubo un error al procesar tu mensaje"
- En la consola del navegador aparece: `Error 404: Not Found`
- El indicador de pensamiento aparece pero nunca se resuelve
- La API responde con: `{"detail":"Sesión no encontrada"}`

## 🚨 Causa Raíz

La sesión configurada en el frontend (`fe38e894-5d52-4e9c-b11f-3edeed4f063d`) ya no existe en el backend. Esto puede ocurrir por:

1. **Reinicio del servidor API**: Las sesiones se pierden al reiniciar el backend
2. **Expiración de sesiones**: El backend puede tener un tiempo de vida limitado para las sesiones
3. **Limpieza automática**: El sistema puede limpiar sesiones inactivas
4. **Cambios en la base de datos**: Si se reinicia la base de datos

## 🔧 Solución Implementada

### Paso 1: Verificar Estado de la Sesión
```bash
curl -X GET http://127.0.0.1:8000/sessions/fe38e894-5d52-4e9c-b11f-3edeed4f063d -v
# Respuesta: 404 Not Found - {"detail":"Sesión no encontrada"}
```

### Paso 2: Crear Nueva Sesión
```bash
curl -X POST http://127.0.0.1:8000/sessions -H "Content-Type: application/json"
# Respuesta: 200 OK - {"session_id":"5a18dc11-5a06-435b-8aef-970e9963d9f2",...}
```

### Paso 3: Subir Documento a la Nueva Sesión
```bash
curl -X POST http://127.0.0.1:8000/sessions/5a18dc11-5a06-435b-8aef-970e9963d9f2/documents \
  -F "file=@doc_prueba/ID041_Ley_20_899_Modifica_Ley_IVA.pdf"
# Respuesta: 200 OK - {"id":"file_ID041_Ley_20_899_Modifica_Ley_IVA.pdf",...}
```

### Paso 4: Actualizar Frontend
```javascript
// En ChatWindow.vue
const sessionId = ref('5a18dc11-5a06-435b-8aef-970e9963d9f2')
```

### Paso 5: Verificar Funcionamiento
```bash
curl -X POST http://127.0.0.1:8000/sessions/5a18dc11-5a06-435b-8aef-970e9963d9f2/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿funciona el chat ahora?"}'
# Respuesta: 200 OK - {"message":"Sí, puedo responder...",...}
```

## 🛠️ Mejoras Preventivas Implementadas

### 1. Manejo de Errores Mejorado
```javascript
if (!response.ok) {
  if (response.status === 400) {
    const errorData = await response.json()
    if (errorData.detail && errorData.detail.includes('documentos')) {
      throw new Error('No hay documentos cargados. Suba al menos un documento antes de chatear.')
    }
  }
  throw new Error(`Error ${response.status}: ${response.statusText}`)
}
```

### 2. Logs Detallados
```javascript
console.log('🚀 Enviando mensaje a la API:', {
  url: `${API_BASE_URL}/sessions/${sessionId.value}/chat`,
  method: 'POST',
  data: requestData
})
```

### 3. Indicador de Pensamiento Mejorado
- Puntos animados mientras procesa
- Mensaje claro: "El asistente está pensando..."
- Desaparece cuando llega la respuesta o error

## 📝 Recomendaciones Futuras

### 1. Gestión Automática de Sesiones
```javascript
// Implementar recreación automática de sesión si expira
const ensureValidSession = async () => {
  try {
    await fetch(`${API_BASE_URL}/sessions/${sessionId.value}`)
  } catch (error) {
    if (error.status === 404) {
      await createSession()
    }
  }
}
```

### 2. Persistencia de Sesiones
- Implementar almacenamiento local de session_id
- Verificar validez al inicializar el chat
- Recrear automáticamente si es necesario

### 3. Monitoreo de Estado
- Health check antes de enviar mensajes
- Validación de sesión en cada interacción
- Fallback a modo offline si la API no está disponible

## 🧪 Comandos de Diagnóstico

### Verificar Estado de la API
```bash
curl -X GET http://127.0.0.1:8000/health
```

### Listar Sesiones Activas
```bash
# Si el endpoint existe
curl -X GET http://127.0.0.1:8000/sessions
```

### Verificar Sesión Específica
```bash
curl -X GET http://127.0.0.1:8000/sessions/{session_id}
```

### Probar Chat Directamente
```bash
curl -X POST http://127.0.0.1:8000/sessions/{session_id}/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## ✅ Estado Actual

- ✅ **Nueva sesión creada**: `5a18dc11-5a06-435b-8aef-970e9963d9f2`
- ✅ **Documento subido**: ID041_Ley_20_899_Modifica_Ley_IVA.pdf
- ✅ **Chat funcionando**: Respuestas correctas de la API
- ✅ **Frontend actualizado**: Usando la nueva sesión
- ✅ **Indicador de pensamiento**: Funcionando correctamente

## 📞 Contacto

Si este error persiste o necesitas ayuda adicional, revisa:
1. Los logs de la consola del navegador (F12)
2. Los logs del servidor API
3. El estado de la base de datos
4. La conectividad de red

---
*Documentación generada automáticamente - Chat Normativo SII*
