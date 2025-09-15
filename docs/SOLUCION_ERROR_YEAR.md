# Solución del Error `filtros.value.year.trim is not a function`

## 🚨 **Problema Identificado**

**Error**: `{error: 'filtros.value.year.trim is not a function', url: '/api/search/documents'}`

**Causa Raíz**: 
- El `v-model` del select estaba recibiendo valores numéricos directamente
- Se intentaba usar `.trim()` en un número, lo cual no es válido
- El método `.trim()` solo funciona en strings

## ✅ **Solución Implementada**

### **1. Conversión de Valores a String en el Template**

**Antes**:
```html
<option v-for="year in yearsRecientes" :key="year" :value="year">
    {{ year }} {{ getYearLabel(year) }}
</option>
```

**Después**:
```html
<option v-for="year in yearsRecientes" :key="year" :value="year.toString()">
    {{ year }} {{ getYearLabel(year) }}
</option>
```

### **2. Validación Robusta en la Función de Búsqueda**

**Antes**:
```javascript
if (filtros.value.year && filtros.value.year.trim()) {
  const year = parseInt(filtros.value.year.trim())
  // ...
}
```

**Después**:
```javascript
if (filtros.value.year) {
  const yearValue = filtros.value.year.toString().trim()
  if (yearValue) {
    const year = parseInt(yearValue)
    // ...
  }
}
```

### **3. Corrección del Proxy de Vite**

**Problema**: El proxy estaba configurado para `localhost:8080` pero la API corre en `localhost:8000`

**Antes**:
```javascript
'/api': {
  target: 'http://localhost:8080',
  changeOrigin: true,
  secure: false,
}
```

**Después**:
```javascript
'/api': {
  target: 'http://localhost:8000',
  changeOrigin: true,
  secure: false,
}
```

## 🔧 **Cambios Técnicos Detallados**

### **1. Template (BuscadorNormativo.vue)**

```html
<!-- Años Recientes -->
<optgroup label="📈 Años Recientes">
    <option v-for="year in yearsRecientes" :key="year" :value="year.toString()">
        {{ year }} {{ getYearLabel(year) }}
    </option>
</optgroup>

<!-- Años Anteriores -->
<optgroup label="📊 Años Anteriores">
    <option v-for="year in yearsAnteriores" :key="year" :value="year.toString()">
        {{ year }}
    </option>
</optgroup>
```

### **2. Función de Búsqueda**

```javascript
// Filtro por año - validar y agregar
if (filtros.value.year) {
  const yearValue = filtros.value.year.toString().trim()
  if (yearValue) {
    const year = parseInt(yearValue)
    if (year >= 1900 && year <= 2030) {
      params.append('year', year.toString())
      logger.search(`Filtro por año aplicado: ${year}`)
    } else {
      logger.warning(`Año inválido: ${year}. Debe estar entre 1900 y 2030`)
    }
  }
}
```

### **3. Configuración del Proxy (vite.config.js)**

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',  // ✅ Corregido de 8080 a 8000
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
```

## 🎯 **Flujo de Datos Corregido**

### **1. Selección de Año**
1. Usuario selecciona año del dropdown
2. `v-model` recibe el valor como string (`"2024"`)
3. `filtros.value.year` contiene string válido

### **2. Validación en Búsqueda**
1. Se verifica que `filtros.value.year` existe
2. Se convierte a string con `.toString()`
3. Se aplica `.trim()` al string resultante
4. Se valida que el string no esté vacío
5. Se convierte a número con `parseInt()`
6. Se valida el rango (1900-2030)

### **3. Envío a la API**
1. Se convierte el año a string para el parámetro
2. Se envía como `year=2024` en la URL
3. La API recibe el parámetro correctamente

## 🚀 **Beneficios de la Solución**

### **✅ Robustez**
- Maneja tanto números como strings
- Validación múltiple de tipos
- Conversión segura de tipos

### **✅ Compatibilidad**
- Funciona con valores del dropdown
- Funciona con botones de acceso rápido
- Funciona con entrada manual

### **✅ Debugging**
- Logs detallados de validación
- Mensajes de error específicos
- Trazabilidad completa

## 🧪 **Casos de Prueba**

### **1. Selección desde Dropdown**
```javascript
// Usuario selecciona "2024" del dropdown
filtros.value.year = "2024"  // ✅ String
yearValue = "2024".trim()     // ✅ "2024"
year = parseInt("2024")       // ✅ 2024
```

### **2. Botón de Año Actual**
```javascript
// Usuario hace click en "📅 Actual"
filtros.value.year = "2024"   // ✅ String (selectCurrentYear)
yearValue = "2024".trim()     // ✅ "2024"
year = parseInt("2024")       // ✅ 2024
```

### **3. Botón de Año Anterior**
```javascript
// Usuario hace click en "⬅️ Anterior"
filtros.value.year = "2023"   // ✅ String (selectLastYear)
yearValue = "2023".trim()     // ✅ "2023"
year = parseInt("2023")       // ✅ 2023
```

### **4. Valor Vacío**
```javascript
// Usuario selecciona "Todos los años"
filtros.value.year = ""       // ✅ String vacío
if (filtros.value.year)       // ✅ false, no se procesa
```

## 📊 **Logs de Validación**

### **Logs Exitosos**:
```javascript
🔍 [14:35:20] Filtro por año aplicado: 2024
🔍 [14:35:21] Filtro por año aplicado: 2023
```

### **Logs de Advertencia**:
```javascript
⚠️ [14:35:22] Año inválido: 1899. Debe estar entre 1900 y 2030
⚠️ [14:35:23] Año inválido: 2031. Debe estar entre 1900 y 2030
```

## 🔄 **Reinicio del Servidor**

**Importante**: Después de cambiar `vite.config.js`, es necesario reiniciar el servidor de desarrollo:

```bash
# Detener el servidor actual (Ctrl+C)
# Reiniciar con:
npm run dev
```

## 🎉 **Resultado Final**

- ✅ **Error eliminado**: No más `trim is not a function`
- ✅ **Funcionalidad restaurada**: El filtro por año funciona correctamente
- ✅ **Proxy corregido**: Las peticiones llegan a la API correcta
- ✅ **Validación robusta**: Maneja todos los casos edge
- ✅ **Logs informativos**: Debugging mejorado

---
*Error del listbox de año solucionado exitosamente*
