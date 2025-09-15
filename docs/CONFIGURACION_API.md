# Configuración de la API - Buscador Normativo

## ✅ Estado Actual

La API está configurada y funcionando correctamente en `http://localhost:8080`.

## 🎯 Configuración Actual

### API Funcionando Correctamente

- **URL Base**: `http://localhost:8080`
- **Endpoint Principal**: `/api/search/documents`
- **Parámetros**: `query` (texto de búsqueda), `limit` (límite de resultados)
- **Nota**: El endpoint `/api/search/stats` no está disponible (403 Forbidden)

### Estructura de Respuesta de tu API

```json
{
  "totalResults": 5,
  "field": "content",
  "query": "ley",
  "limit": 5,
  "results": [
    {
      "snippet": "Texto del documento...",
      "score": 0.026913334,
      "filename": "ID1462_Modificaciones_Ley_21_210...",
      "filepath": "/ruta/completa/al/archivo.pdf",
      "size": "155866",
      "year": "2020",
      "documentId": "ID1462",
      "lastModified": "1728445110000",
      "title": "Modificaciones Ley 21 210 Regimenes Tributarios..."
    }
  ]
}
```

### Comandos de Prueba

```bash
# Probar búsqueda básica
curl -X GET "http://localhost:8080/api/search/documents?query=IVA&limit=3"

# Probar búsqueda por año
curl -X GET "http://localhost:8080/api/search/documents?query=ley&year=2020&limit=5"

# Probar búsqueda de términos específicos
curl -X GET "http://localhost:8080/api/search/documents?query=tributario&limit=10"
```

## ✅ Estado del Sistema

### ✅ Configuración Completada

- [x] ✅ API corriendo en puerto 8080
- [x] ✅ Endpoint `/api/search/documents` funcionando
- [x] ✅ URL configurada en `src/config/api.js`
- [x] ✅ Conectividad verificada con `curl`
- [x] ✅ Búsqueda funcionando con datos reales

### 🎯 Funcionalidades Implementadas

- **Búsqueda por texto**: Usa el parámetro `query`
- **Límite de resultados**: Configurado a 10 por defecto
- **Filtro por año**: Soporte para parámetro `year`
- **Mapeo de datos**: Convierte la respuesta de tu API al formato del frontend
- **Detección de tipo**: Extrae automáticamente el tipo de documento del título
- **Score de relevancia**: Muestra el score de cada resultado
- **Información completa**: Título, fecha, año, archivo, snippet
- **Solo datos reales**: Eliminados todos los datos de prueba
- **Sin estadísticas**: El endpoint de stats no está disponible en tu API

## 🔍 Debugging

### Verificar en el Navegador (F12)

1. **Console**: Ver logs de búsqueda
2. **Network**: Ver requests HTTP
3. **Errores**: Verificar CORS o conectividad

### Logs Esperados

```javascript
// Búsqueda exitosa
🔍 Iniciando búsqueda con filtros: {titulo: "ley", tipo: "", ...}
📡 URL de búsqueda: http://127.0.0.1:8000/api/search/documents?title=ley
📥 Resultados recibidos: {documents: [...]}

// Error de conectividad
❌ Error en búsqueda: TypeError: Failed to fetch
🔄 Usando datos de prueba...
```

## 🚀 Una Vez Configurado

Cuando tu API esté funcionando correctamente:

1. **Los datos de prueba desaparecerán**
2. **Se mostrarán resultados reales** de tu API
3. **Las estadísticas serán reales**
4. **Los filtros funcionarán** con datos reales

## 📞 Soporte

Si necesitas ayuda:

1. **Verifica el puerto** de tu API
2. **Comprueba los endpoints** disponibles
3. **Revisa los logs** del navegador (F12)
4. **Prueba con curl** los endpoints

---
*Documentación generada automáticamente - Buscador Normativo SII*
