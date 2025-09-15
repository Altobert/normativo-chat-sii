# Mejoras en la Búsqueda por Año

## 🚨 **Problema Identificado**

**Problema**: El filtrado por año no estaba funcionando correctamente.

**Síntomas observados**:
- Se enviaba el parámetro `year=2020` pero no filtraba correctamente
- Interfaz poco intuitiva para seleccionar años
- Falta de validación en los filtros
- No se mostraban los filtros aplicados

## ✅ **Mejoras Implementadas**

### **1. Selector de Años Mejorado**

**Antes**: Campo de texto numérico
```html
<input type="number" v-model="filtros.year" placeholder="Año específico" min="1900" max="2030" />
```

**Después**: Selector desplegable con años predefinidos
```html
<select v-model="filtros.year" class="year-select">
    <option value="">Todos los años</option>
    <option value="2024">2024</option>
    <option value="2023">2023</option>
    <!-- ... años desde 2024 hasta 2000 -->
</select>
```

### **2. Validación de Filtros**

```javascript
// Filtro por año - validar y agregar
if (filtros.value.year && filtros.value.year.trim()) {
  const year = parseInt(filtros.value.year.trim())
  if (year >= 1900 && year <= 2030) {
    params.append('year', year.toString())
    logger.search(`Filtro por año aplicado: ${year}`)
  } else {
    logger.warning(`Año inválido: ${year}. Debe estar entre 1900 y 2030`)
  }
}
```

### **3. Filtros Adicionales**

```javascript
// Filtro por tipo de documento
if (filtros.value.tipo && filtros.value.tipo.trim()) {
  params.append('type', filtros.value.tipo.trim())
  logger.search(`Filtro por tipo aplicado: ${filtros.value.tipo}`)
}

// Filtros de fecha
if (filtros.value.fechaDesde && filtros.value.fechaDesde.trim()) {
  params.append('date_from', filtros.value.fechaDesde.trim())
  logger.search(`Filtro por fecha desde: ${filtros.value.fechaDesde}`)
}

if (filtros.value.fechaHasta && filtros.value.fechaHasta.trim()) {
  params.append('date_to', filtros.value.fechaHasta.trim())
  logger.search(`Filtro por fecha hasta: ${filtros.value.fechaHasta}`)
}
```

### **4. Visualización de Filtros Aplicados**

```javascript
// Computed para mostrar filtros aplicados
const filtrosAplicados = computed(() => {
  const aplicados = []
  
  if (filtros.value.titulo && filtros.value.titulo.trim()) {
    aplicados.push(`Título: "${filtros.value.titulo.trim()}"`)
  }
  
  if (filtros.value.tipo && filtros.value.tipo.trim()) {
    aplicados.push(`Tipo: ${filtros.value.tipo}`)
  }
  
  if (filtros.value.year && filtros.value.year.trim()) {
    aplicados.push(`Año: ${filtros.value.year}`)
  }
  
  if (filtros.value.fechaDesde && filtros.value.fechaDesde.trim()) {
    aplicados.push(`Desde: ${filtros.value.fechaDesde}`)
  }
  
  if (filtros.value.fechaHasta && filtros.value.fechaHasta.trim()) {
    aplicados.push(`Hasta: ${filtros.value.fechaHasta}`)
  }
  
  return aplicados
})
```

### **5. Funciones de Utilidad**

```javascript
// Función para limpiar filtros
function limpiarFiltros() {
  logger.user('Limpiando todos los filtros')
  filtros.value = {
    titulo: '',
    tipo: '',
    year: '',
    fechaDesde: '',
    fechaHasta: ''
  }
}

// Función para buscar solo por año
async function buscarSoloPorAño() {
  if (!filtros.value.year) {
    alert('Por favor selecciona un año para buscar')
    return
  }
  
  logger.user(`Búsqueda específica por año: ${filtros.value.year}`)
  filtros.value.titulo = ''
  filtros.value.tipo = ''
  await buscar()
}
```

## 🎨 **Mejoras en la Interfaz**

### **1. Botón de Limpiar Filtros**
```html
<button @click="limpiarFiltros" class="btn-clear" :disabled="isSearching">
    🗑️ Limpiar
</button>
```

### **2. Visualización de Filtros Aplicados**
```html
<div v-if="filtrosAplicados.length > 0" class="filtros-aplicados">
    <strong>Filtros aplicados:</strong>
    <span v-for="filtro in filtrosAplicados" :key="filtro" class="filtro-tag">
        {{ filtro }}
    </span>
</div>
```

### **3. Estilos Mejorados**
```css
.year-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.filtro-tag {
  background: #e3f2fd;
  color: #003366;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #bbdefb;
}
```

## 📊 **Parámetros de Búsqueda Mejorados**

### **Antes:**
```
GET /api/search/documents?query=iva&limit=10&year=2020
```

### **Después:**
```
GET /api/search/documents?query=iva&limit=20&year=2020&type=ley&date_from=2020-01-01&date_to=2020-12-31
```

### **Parámetros Disponibles:**
- `query`: Término de búsqueda en el título
- `limit`: Número de resultados (aumentado a 20)
- `year`: Año específico del documento
- `type`: Tipo de documento (ley, decreto, resolución)
- `date_from`: Fecha desde (formato YYYY-MM-DD)
- `date_to`: Fecha hasta (formato YYYY-MM-DD)

## 🎯 **Cómo Usar las Mejoras**

### **1. Búsqueda por Año**
1. Selecciona un año del dropdown
2. Haz click en "🔍 Buscar"
3. Verás solo documentos de ese año

### **2. Búsqueda Combinada**
1. Ingresa un término de búsqueda
2. Selecciona un año
3. Selecciona un tipo de documento
4. Haz click en "🔍 Buscar"

### **3. Limpiar Filtros**
1. Haz click en "🗑️ Limpiar"
2. Todos los filtros se resetean
3. Puedes empezar una nueva búsqueda

### **4. Ver Filtros Aplicados**
- Los filtros activos aparecen como tags debajo de los resultados
- Cada tag muestra el tipo de filtro y su valor

## 📈 **Beneficios de las Mejoras**

### **Para el Usuario:**
- ✅ **Selector intuitivo** de años con opciones predefinidas
- ✅ **Validación automática** de filtros
- ✅ **Visualización clara** de filtros aplicados
- ✅ **Botón de limpiar** para resetear búsquedas
- ✅ **Más resultados** (20 en lugar de 10)

### **Para el Sistema:**
- ✅ **Logging detallado** de filtros aplicados
- ✅ **Validación robusta** de parámetros
- ✅ **Mejor manejo de errores**
- ✅ **Interfaz más profesional**

## 🔧 **Logs Implementados**

### **Logs de Filtros:**
```javascript
🔍 [14:35:20] Filtro por año aplicado: 2020
🔍 [14:35:21] Filtro por tipo aplicado: ley
🔍 [14:35:22] Filtro por fecha desde: 2020-01-01
👤 [14:35:23] Limpiando todos los filtros
👤 [14:35:24] Búsqueda específica por año: 2020
```

### **Logs de Validación:**
```javascript
⚠️ [14:35:20] Año inválido: 2050. Debe estar entre 1900 y 2030
```

## 🚀 **Próximas Mejoras**

- [ ] **Búsqueda por rango de años** (ej: 2020-2023)
- [ ] **Filtros avanzados** (por score, por estado)
- [ ] **Búsqueda por palabras clave** en el contenido
- [ ] **Historial de búsquedas** recientes
- [ ] **Favoritos** de documentos
- [ ] **Exportar resultados** de búsqueda

---
*Sistema de Búsqueda Mejorado implementado para el Buscador Normativo SII*
