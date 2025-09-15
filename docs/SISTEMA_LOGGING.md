# Sistema de Logging - Buscador Normativo

## 🎯 Descripción

Se ha implementado un sistema de logging que registra todas las acciones ejecutadas en el buscador normativo **únicamente en la consola del navegador**, permitiendo un seguimiento detallado de las operaciones del usuario y del sistema durante el desarrollo.

## 📋 Componentes del Sistema

### 1. Logger Principal (`src/utils/logger.js`)

**Características:**
- ✅ **8 tipos de logs** con iconos distintivos
- ✅ **Solo consola del navegador** (sin almacenamiento en memoria)
- ✅ **Formato estructurado** con timestamp
- ✅ **Colores distintivos** por tipo de log
- ✅ **Datos estructurados** en formato JSON

**Tipos de Logs:**
- `info` ℹ️ - Información general
- `success` ✅ - Operaciones exitosas
- `warning` ⚠️ - Advertencias
- `error` ❌ - Errores
- `search` 🔍 - Búsquedas
- `api` 📡 - Comunicación con API
- `user` 👤 - Acciones del usuario
- `system` ⚙️ - Eventos del sistema

## 🚀 Funcionalidades Implementadas

### En BuscadorNormativo.vue:

**🔍 Búsquedas:**
- Inicio de búsqueda con filtros
- Request a la API con parámetros
- Respuesta de la API con estadísticas
- Resultados encontrados
- Errores de búsqueda

**👤 Acciones del Usuario:**
- Click en área del buscador
- Búsqueda de todos los documentos
- Solicitud de ver documento
- Búsqueda por ID específico

**📡 Comunicación API:**
- URLs de requests
- Parámetros enviados
- Status de respuestas
- Datos recibidos
- Errores de conectividad

**⚙️ Sistema:**
- Montaje del componente
- Configuración de estadísticas

## 📊 Ejemplo de Logs

```
⚙️ [14:16:55] Componente BuscadorNormativo montado

👤 [14:17:02] Click en el área del buscador - ocultando chat

🔍 [14:17:05] Iniciando búsqueda de documentos
📊 Datos: {
  "titulo": "IVA",
  "tipo": "",
  "year": "",
  "fechaDesde": "",
  "fechaHasta": ""
}

📡 [14:17:05] Enviando request a la API
📊 Datos: {
  "url": "/api/search/documents?query=IVA&limit=10",
  "params": {
    "query": "IVA",
    "limit": "10"
  }
}

📡 [14:17:05] Respuesta recibida de la API
📊 Datos: {
  "status": 200,
  "totalResults": 3,
  "resultsCount": 3
}

✅ [14:17:05] Búsqueda completada - 3 documentos encontrados

ℹ️ [14:17:05] Búsqueda finalizada
```

## 🎮 Cómo Usar

### 1. Abrir Consola del Navegador
- **Chrome/Edge**: F12 → Pestaña "Console"
- **Firefox**: F12 → Pestaña "Consola"
- **Safari**: Cmd+Option+I → Pestaña "Console"

### 2. Ver Logs en Tiempo Real
- Los logs aparecen automáticamente al usar el buscador
- Cada acción genera un log con timestamp y datos
- Colores distintivos por tipo de evento

### 3. Información Mostrada
- **Timestamp**: Hora exacta de cada acción
- **Tipo**: Icono y categoría del log con color
- **Mensaje**: Descripción de la acción
- **Datos**: Información adicional estructurada en JSON

## 🔧 Configuración

### Acceso Global:
```javascript
// Disponible en la consola del navegador
window.logger.info('Mensaje de prueba')
window.logger.error('Error de prueba', { codigo: 500 })
window.logger.clearLogs() // Limpiar consola
```

### Comandos Útiles en Consola:
```javascript
// Limpiar consola
logger.clearLogs()

// Ver ayuda
logger.info('Sistema de logging activo')

// Probar diferentes tipos
logger.search('Prueba de búsqueda')
logger.api('Prueba de API')
logger.user('Prueba de usuario')
```

## 📈 Beneficios

### Para Desarrollo:
- ✅ **Debugging fácil** de problemas
- ✅ **Seguimiento de requests** API
- ✅ **Identificación de errores** rápidamente
- ✅ **Análisis de comportamiento** del usuario

### Para Producción:
- ✅ **Monitoreo en tiempo real**
- ✅ **Exportación de logs** para análisis
- ✅ **Historial de acciones** del usuario
- ✅ **Diagnóstico de problemas** de conectividad

## 🚀 Próximas Mejoras

- [ ] **Filtros de logs** por tipo
- [ ] **Búsqueda en logs** por texto
- [ ] **Logs persistentes** en localStorage
- [ ] **Métricas de rendimiento** (tiempo de respuesta)
- [ ] **Integración con servicios** de monitoreo externos

---
*Sistema de Logging implementado para el Buscador Normativo SII*
