# Verificación del Upload de Documentos al Chat

## 🔍 **¿Se está realizando el upload del documento al chat?**

Esta es una pregunta importante para verificar si el sistema está funcionando correctamente. Aquí te explico cómo verificarlo:

## 📊 **Métodos de Verificación**

### **1. Logs en la Consola del Navegador**

Cuando hagas click en "💬 Chatear con documento", deberías ver estos logs:

```javascript
👤 [14:35:20] Abriendo chat con documento: Ley 20.899 Modifica Ley IVA
📡 [14:35:21] Iniciando subida de documento a sesión
📊 Datos: { "sessionId": "abc123", "documento": "Ley 20.899 Modifica Ley IVA" }
📡 [14:35:22] Subiendo documento a sesión de chat
📊 Datos: { "sessionId": "abc123", "documento": "Ley 20.899 Modifica Ley IVA" }
📡 [14:35:23] Enviando documento a API de chat
📊 Datos: { "url": "http://localhost:8000/sessions/abc123/documents", "method": "POST" }
📡 [14:35:24] Respuesta recibida de subida de documento
📊 Datos: { "status": 200, "statusText": "OK", "ok": true }
✅ [14:35:25] Documento subido a sesión: Ley 20.899 Modifica Ley IVA
📡 [14:35:26] Resultado de subida de documento
📊 Datos: { "sessionId": "abc123", "resultado": "Éxito" }
```

### **2. Logs en la Terminal (Vite)**

En la terminal donde corre `npm run dev`, deberías ver:

```
Sending Request to the Target: POST /api/sessions
Received Response from the Target: 200 /api/sessions
Sending Request to the Target: POST /api/sessions/abc123/documents
Received Response from the Target: 200 /api/sessions/abc123/documents
```

### **3. Verificación Manual con cURL**

Puedes verificar manualmente si la API está funcionando:

```bash
# 1. Crear sesión
curl -X POST "http://localhost:8000/sessions" -H "Content-Type: application/json"

# Respuesta esperada:
# {"session_id":"abc123","documents":[],"messages":[],"created_at":"2025-09-15T02:58:28.881107"}

# 2. Subir documento de prueba
echo "Documento de prueba" > test.txt
curl -X POST "http://localhost:8000/sessions/abc123/documents" -F "file=@test.txt"

# Respuesta esperada:
# {"id":"file_test.txt","name":"test.txt","type":"document","upload_date":"2025-09-15T02:58:43.069376"}

# 3. Probar chat
curl -X POST "http://localhost:8000/sessions/abc123/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué dice este documento?", "session_id": "abc123"}'
```

## 🚨 **Posibles Problemas**

### **Problema 1: No se ven logs de subida**
**Síntoma**: No aparecen logs de "Subiendo documento a sesión de chat"
**Causa**: La función `subirDocumentoASesion` no se está ejecutando
**Solución**: Verificar que se esté llamando desde `abrirChatConDocumento`

### **Problema 2: Error 403 en subida**
**Síntoma**: `Received Response from the Target: 403 /api/sessions/.../documents`
**Causa**: Problema de CORS o permisos en la API
**Solución**: Verificar configuración de CORS en la API

### **Problema 3: Error 400 en subida**
**Síntoma**: `Received Response from the Target: 400 /api/sessions/.../documents`
**Causa**: Formato de archivo no permitido
**Solución**: Verificar que se esté enviando como `text/plain`

### **Problema 4: No hay respuesta del chat**
**Síntoma**: Chat responde "No tengo información sobre esto"
**Causa**: Documento no se subió correctamente o no tiene suficiente contenido
**Solución**: Verificar logs de subida y contenido del documento

## 🔧 **Pasos para Diagnosticar**

### **Paso 1: Verificar Logs**
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca documentos y haz click en "💬 Chatear con documento"
4. Verifica que aparezcan los logs de subida

### **Paso 2: Verificar Terminal**
1. Mira la terminal donde corre `npm run dev`
2. Deberías ver requests a `/api/sessions/.../documents`
3. Verifica que las respuestas sean 200 (éxito)

### **Paso 3: Verificar API Manualmente**
```bash
# Crear sesión de prueba
curl -X POST "http://localhost:8000/sessions"

# Subir documento de prueba
echo "Documento de prueba para verificar upload" > test.txt
curl -X POST "http://localhost:8000/sessions/[SESSION_ID]/documents" -F "file=@test.txt"

# Probar chat
curl -X POST "http://localhost:8000/sessions/[SESSION_ID]/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué dice este documento?", "session_id": "[SESSION_ID]"}'
```

## 📋 **Checklist de Verificación**

- [ ] **Logs de consola**: Aparecen logs de subida de documento
- [ ] **Logs de terminal**: Se ven requests a `/documents` con respuesta 200
- [ ] **API manual**: cURL funciona correctamente
- [ ] **Chat responde**: El chat da respuestas específicas del documento
- [ ] **Sin errores**: No hay errores 403, 400, o 500

## 🎯 **Resultado Esperado**

Si todo funciona correctamente, deberías ver:

1. **En consola del navegador**:
   ```
   📡 [14:35:23] Enviando documento a API de chat
   📡 [14:35:24] Respuesta recibida de subida de documento
   ✅ [14:35:25] Documento subido a sesión: [Título del documento]
   ```

2. **En terminal**:
   ```
   Sending Request to the Target: POST /api/sessions/abc123/documents
   Received Response from the Target: 200 /api/sessions/abc123/documents
   ```

3. **En el chat**:
   ```
   Usuario: "¿Qué dice esta ley sobre el IVA?"
   Chat: "Basándome en el documento 'Ley 20.899 Modifica Ley IVA'..."
   ```

## 🚀 **Si No Funciona**

Si no ves estos logs o el chat no responde correctamente:

1. **Verifica que la API esté corriendo** en `http://localhost:8000`
2. **Revisa los logs de consola** para errores
3. **Prueba manualmente** con cURL
4. **Verifica la configuración** de CORS en la API

---
*Guía de Verificación del Upload de Documentos implementada para el Buscador Normativo SII*
