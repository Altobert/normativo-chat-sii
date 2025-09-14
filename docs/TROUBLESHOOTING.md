# Guía de Resolución de Problemas - Chat Normativo SII

## 🚨 Errores Comunes y Soluciones

### 1. Error: "No hay documentos cargados"

**Síntomas:**
- Mensaje: "No hay documentos cargados. Suba al menos un documento antes de chatear."
- Status: 400 Bad Request

**Solución:**
```bash
# Crear nueva sesión
curl -X POST http://127.0.0.1:8000/sessions

# Subir documento
curl -X POST http://127.0.0.1:8000/sessions/{session_id}/documents \
  -F "file=@ruta/al/documento.pdf"
```

### 2. Error: "Sesión no encontrada"

**Síntomas:**
- Status: 404 Not Found
- Mensaje: "Sesión no encontrada"

**Solución:**
- Crear nueva sesión
- Actualizar sessionId en el frontend
- Ver documentación completa: [ERROR_SESION_EXPIRADA.md](./ERROR_SESION_EXPIRADA.md)

### 3. Error de Conectividad

**Síntomas:**
- Network error en la consola
- Timeout en las requests
- "Lo siento, hubo un error al procesar tu mensaje"

**Solución:**
```bash
# Verificar que la API esté corriendo
curl -X GET http://127.0.0.1:8000/health

# Verificar conectividad
ping 127.0.0.1
```

### 4. Indicador de Pensamiento No Desaparece

**Síntomas:**
- Los puntos animados siguen apareciendo
- No llega respuesta del bot

**Solución:**
- Verificar logs en la consola (F12)
- Comprobar que la API esté respondiendo
- Verificar que la sesión sea válida

## 🔍 Herramientas de Diagnóstico

### Consola del Navegador (F12)
```javascript
// Verificar estado del chat
console.log('Session ID:', sessionId.value)
console.log('Messages:', messages.value)
console.log('Is Typing:', isTyping.value)
```

### Network Tab (F12)
- Verificar requests HTTP
- Comprobar status codes
- Revisar response data

### API Health Check
```bash
curl -X GET http://127.0.0.1:8000/health
```

### Probar Sesión Específica
```bash
curl -X GET http://127.0.0.1:8000/sessions/{session_id}
```

## 🛠️ Comandos Útiles

### Crear Sesión Nueva
```bash
curl -X POST http://127.0.0.1:8000/sessions \
  -H "Content-Type: application/json"
```

### Subir Documento
```bash
curl -X POST http://127.0.0.1:8000/sessions/{session_id}/documents \
  -F "file=@documento.pdf"
```

### Probar Chat
```bash
curl -X POST http://127.0.0.1:8000/sessions/{session_id}/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

### Ver Historial
```bash
curl -X GET http://127.0.0.1:8000/sessions/{session_id}/messages
```

## 📋 Checklist de Verificación

### Antes de Reportar un Error:
- [ ] ¿La API está corriendo? (`curl /health`)
- [ ] ¿La sesión existe? (`curl /sessions/{id}`)
- [ ] ¿Hay documentos subidos?
- [ ] ¿Los logs muestran errores específicos?
- [ ] ¿El navegador tiene conectividad?

### Para Desarrolladores:
- [ ] Revisar logs de la consola
- [ ] Verificar Network tab
- [ ] Comprobar sessionId en el código
- [ ] Validar formato de requests
- [ ] Confirmar estructura de responses

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```javascript
const API_BASE_URL = 'http://127.0.0.1:8000'
const sessionId = ref('tu-session-id-aqui')
```

### Logs Habilitados
```javascript
console.log('🚀 Enviando mensaje a la API:', requestData)
console.log('📡 Respuesta de la API:', responseData)
console.log('📥 Datos recibidos:', data)
```

## 📞 Escalación

Si los problemas persisten:

1. **Recopilar información:**
   - Screenshots del error
   - Logs de la consola
   - Status codes de las requests
   - Versión del navegador

2. **Verificar entorno:**
   - Versión de la API
   - Estado de la base de datos
   - Logs del servidor

3. **Contactar soporte:**
   - Incluir toda la información recopilada
   - Describir pasos para reproducir
   - Especificar entorno de desarrollo

---
*Guía mantenida por el equipo de desarrollo - Chat Normativo SII*
