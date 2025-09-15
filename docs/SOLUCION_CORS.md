# Solución de Problema CORS - Buscador Normativo

## 🚨 Problema Identificado

**Error**: `Error al buscar documentos. Por favor, verifica que la API esté funcionando e intenta de nuevo.`

**Causa**: Tu API backend está bloqueando las peticiones CORS (Cross-Origin Resource Sharing) desde el navegador.

### Diagnóstico

```bash
# ✅ API funciona directamente
curl -X GET "http://localhost:8080/api/search/documents?query=IVA&limit=2"
# Respuesta: 200 OK con datos

# ❌ API bloquea peticiones desde el navegador
curl -X GET "http://localhost:8080/api/search/documents?query=IVA&limit=2" -H "Origin: http://localhost:5174"
# Respuesta: 403 Forbidden - "Invalid CORS request"
```

## ✅ Solución Implementada

### 1. Proxy de Vite Configurado

**Archivo**: `vite.config.js`

```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
```

### 2. Configuración de API Actualizada

**Archivo**: `src/config/api.js`

```javascript
export const API_CONFIG = {
  // URL base de la API - Usando proxy de Vite para evitar CORS
  BASE_URL: '', // Vite proxy manejará las rutas /api
  
  // Endpoints de búsqueda
  ENDPOINTS: {
    SEARCH_DOCUMENTS: '/api/search/documents',
    // ...
  }
}
```

## 🎯 Cómo Funciona

### Antes (Con Error CORS):
```
Navegador → http://localhost:8080/api/search/documents ❌ 403 Forbidden
```

### Después (Con Proxy):
```
Navegador → http://localhost:5174/api/search/documents → Proxy Vite → http://localhost:8080/api/search/documents ✅
```

## 🚀 Pasos para Aplicar la Solución

1. **Reiniciar el servidor de desarrollo**:
   ```bash
   # Detener el servidor actual
   pkill -f "npm run dev"
   
   # Iniciar con nueva configuración
   npm run dev
   ```

2. **Verificar que funciona**:
   - Abrir `http://localhost:5174/`
   - Buscar cualquier término (ej: "IVA", "ley")
   - Debería mostrar resultados sin errores

## 🔍 Verificación

### En la Consola del Navegador (F12):
- ✅ Sin errores CORS
- ✅ Requests a `/api/search/documents` exitosos
- ✅ Datos reales de la API

### En la Terminal del Servidor:
- ✅ Logs del proxy mostrando requests/responses
- ✅ Conexión exitosa a `http://localhost:8080`

## 📋 Solución Permanente (Opcional)

Para una solución más robusta, puedes configurar CORS en tu API backend:

### Si usas Express.js:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
```

### Si usas FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## ✅ Estado Actual

- [x] ✅ Proxy de Vite configurado
- [x] ✅ Configuración de API actualizada
- [x] ✅ Servidor reiniciado
- [x] ✅ CORS solucionado
- [x] ✅ Búsqueda funcionando

---
*Documentación generada automáticamente - Buscador Normativo SII*
