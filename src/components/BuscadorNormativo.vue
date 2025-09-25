<template>
    <div class="buscador-normativo" @click="handleBuscadorClick">
        <div class="filtros">
            <input 
                v-model="filtros.titulo" 
                placeholder="Buscar por título..." 
                @keyup.enter="buscar"
            />
            <select v-model="filtros.tipo">
                <option value="">Todos los tipos</option>
                <option value="ley">Ley</option>
                <option value="decreto">Decreto</option>
                <option value="resolucion">Resolución</option>
            </select>
                <div class="year-selector">
                    <select v-model="filtros.year" class="year-select" @change="onYearChange">
                        <option value="">📅 Todos los años</option>
                        <optgroup label="📈 Años Recientes">
                            <option v-for="year in yearsRecientes" :key="year" :value="year.toString()">
                                {{ year }} {{ getYearLabel(year) }}
                            </option>
                        </optgroup>
                        <optgroup label="📊 Años Anteriores">
                            <option v-for="year in yearsAnteriores" :key="year" :value="year.toString()">
                                {{ year }}
                            </option>
                        </optgroup>
                    </select>
                    <div class="year-actions">
                        <button @click="selectCurrentYear" class="btn-year-current" title="Año actual">
                            📅 Actual
                        </button>
                        <button @click="selectLastYear" class="btn-year-last" title="Año anterior">
                            ⬅️ Anterior
                        </button>
                    </div>
                </div>
            <input 
                type="date" 
                v-model="filtros.fechaDesde" 
                placeholder="Desde" 
            />
            <input 
                type="date" 
                v-model="filtros.fechaHasta" 
                placeholder="Hasta" 
            />
                <button @click.stop="buscar" :disabled="isSearching">
                    <span v-if="!isSearching">🔍 Buscar</span>
                    <span v-else>⏳ Buscando...</span>
                </button>
                <button @click.stop="limpiarFiltros" class="btn-clear" :disabled="isSearching">
                    🗑️ Limpiar
                </button>
        </div>
        
            <!-- Estadísticas de búsqueda -->
            <div v-if="hasSearched" class="stats">
                <div class="stat-item">
                    <strong>{{ resultados.length }}</strong> resultados encontrados
                </div>
                <div class="stat-item">
                    <span>Búsqueda en documentos normativos del SII</span>
                </div>
                <div v-if="filtrosAplicados.length > 0" class="filtros-aplicados">
                    <strong>Filtros aplicados:</strong>
                    <span v-for="filtro in filtrosAplicados" :key="filtro" class="filtro-tag">
                        {{ filtro }}
                    </span>
                </div>
            </div>
        
        <div class="resultados">
            <div v-if="isSearching" class="loading">
                <div class="spinner"></div>
                <span>Buscando documentos...</span>
            </div>
            <div v-else-if="resultados.length === 0 && hasSearched" class="no-results">
                <p>No se encontraron documentos que coincidan con tu búsqueda.</p>
                <button @click="buscarTodos" class="btn-secondary">Ver todos los documentos</button>
            </div>
            <div v-else-if="resultados.length === 0" class="no-results">
                <p>Ingresa criterios de búsqueda para encontrar documentos normativos.</p>
            </div>
            <ul v-else class="document-list">
                <li v-for="doc in resultados" :key="doc.id" class="document-item">
                    <div class="document-header">
                        <h3 class="document-title">{{ doc.title }}</h3>
                        <span class="document-type">{{ doc.type }}</span>
                        <span v-if="doc.score" class="document-score">Score: {{ doc.score.toFixed(2) }}</span>
                    </div>
                    <div class="document-meta">
                        <span class="document-date">{{ formatDate(doc.date) }}</span>
                        <span v-if="doc.year" class="document-year">Año: {{ doc.year }}</span>
                        <span v-if="doc.filename" class="document-filename">{{ doc.filename }}</span>
                    </div>
                    <div v-if="doc.summary" class="document-summary">
                        {{ doc.summary }}
                    </div>
                    <div class="document-actions">
                        <button @click="verDocumento(doc.id)" class="btn-primary">
                            Ver documento
                        </button>
                        <button @click="buscarPorId(doc.id)" class="btn-secondary">
                            Buscar por ID
                        </button>
                        <button @click="chatearConDocumento(doc)" class="btn-chat">
                            💬 Chatear con documento
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API_CONFIG, buildApiUrl, checkApiHealth } from '../config/api.js'
import logger from '../utils/logger.js'
import { useNotifications } from '../composables/useNotifications.js'

// Configuración de la API
const API_BASE_URL = API_CONFIG.BASE_URL

// Sistema de notificaciones
const { success, error, warning, info } = useNotifications()

// Estado del componente
const filtros = ref({
    titulo: '',
    tipo: '',
    year: '',
    fechaDesde: '',
    fechaHasta: ''
})

const resultados = ref([])
const stats = ref(null)
const isSearching = ref(false)
const hasSearched = ref(false)

// Generar años dinámicamente
const currentYear = new Date().getFullYear()
const yearsRecientes = computed(() => {
  const years = []
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i)
  }
  return years
})

const yearsAnteriores = computed(() => {
  const years = []
  for (let i = currentYear - 6; i >= 2000; i--) {
    years.push(i)
  }
  return years
})

// Función para obtener etiqueta del año
function getYearLabel(year) {
  if (year === currentYear) return '(Actual)'
  if (year === currentYear - 1) return '(Anterior)'
  return ''
}

// Función para manejar cambio de año
function onYearChange() {
  logger.user(`Año seleccionado: ${filtros.value.year}`)
}

// Función para seleccionar año actual
function selectCurrentYear() {
  logger.user(`Seleccionando año actual: ${currentYear}`)
  filtros.value.year = currentYear.toString()
}

// Función para seleccionar año anterior
function selectLastYear() {
  const lastYear = currentYear - 1
  logger.user(`Seleccionando año anterior: ${lastYear}`)
  filtros.value.year = lastYear.toString()
}

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

// Función para manejar clicks en el buscador
function handleBuscadorClick() {
    logger.user('Click en el área del buscador - ocultando chat')
    emit('hideChat')
}

// Función principal de búsqueda
async function buscar() {
  if (isSearching.value) return

  isSearching.value = true
  hasSearched.value = true

  logger.search('Iniciando búsqueda de documentos', filtros.value)

  try {
    console.log('🔍 Iniciando búsqueda con filtros:', filtros.value)

    // Construir parámetros de búsqueda para la API real
    const params = new URLSearchParams()

    // La API requiere 'query' como parámetro principal
    if (filtros.value.titulo && filtros.value.titulo.trim()) {
      params.append('query', filtros.value.titulo.trim())
    } else {
      // Si no hay título, buscar documentos generales
      params.append('query', 'documento')
    }

    // Agregar límite de resultados
    params.append('limit', '20')

    // Filtro por año - usar endpoint específico si hay año
    let url
    if (filtros.value.year && filtros.value.year.trim()) {
      const yearValue = filtros.value.year.toString().trim()
      if (yearValue) {
        const year = parseInt(yearValue)
        if (year >= 1900 && year <= 2030) {
          url = `${API_BASE_URL}/api/search/documents/year/${year}?${params.toString()}`
          logger.search(`Filtro por año aplicado: ${year}`)
        } else {
          logger.warning(`Año inválido: ${year}. Debe estar entre 1900 y 2030`)
          url = `${API_BASE_URL}/api/search/documents?${params.toString()}`
        }
      } else {
        url = `${API_BASE_URL}/api/search/documents?${params.toString()}`
      }
    } else {
      url = `${API_BASE_URL}/api/search/documents?${params.toString()}`
    }

    console.log('📡 URL de búsqueda:', url)

    logger.api('Enviando request a la API real', { url, params: Object.fromEntries(params) })

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📥 Resultados recibidos:', data)

    logger.api('Respuesta recibida de la API real', {
        status: response.status,
        totalResults: data.totalResults,
        resultsCount: data.results?.length || 0
    })

    // La API real devuelve los resultados en 'results'
    if (data.results && Array.isArray(data.results)) {
        // Mapear los resultados de la API real al formato esperado por el frontend
        resultados.value = data.results.map(doc => ({
            id: doc.documentId || doc.id,
            title: doc.title || 'Sin título',
            type: extraerTipoDocumento(doc.title || doc.filename),
            date: formatearFecha(doc.lastModified),
            year: doc.year,
            summary: doc.snippet || 'Sin resumen disponible',
            filename: doc.filename,
            score: doc.score
        }))

        // Aplicar filtros adicionales en el frontend si es necesario
        if (filtros.value.tipo && filtros.value.tipo.trim()) {
          resultados.value = resultados.value.filter(doc => 
            doc.type === filtros.value.tipo
          )
          logger.search(`Filtro por tipo aplicado: ${filtros.value.tipo}`)
        }

        logger.success(`Búsqueda completada - ${resultados.value.length} documentos encontrados`)
    } else {
        resultados.value = []
        logger.warning('No se encontraron resultados en la respuesta de la API')
    }

  } catch (error) {
    console.error('❌ Error en búsqueda:', error)
    resultados.value = []

    logger.error('Error en la búsqueda de documentos', {
        error: error.message,
        url: `${API_BASE_URL}/api/search/documents`
    })

    // Mostrar mensaje de error al usuario
    error('Error al buscar documentos. Por favor, verifica que la API esté funcionando e intenta de nuevo.', 'Error de búsqueda')

  } finally {
    isSearching.value = false
    logger.info('Búsqueda finalizada')
  }
}

// Función para generar datos de prueba
function generarDatosPrueba(filtros) {
  const documentosBase = [
    {
      id: 'ID001',
      title: 'Ley 20.899 - Modifica Ley de IVA',
      type: 'ley',
      date: '2024-01-15',
      year: 2024,
      summary: 'Esta ley modifica diversos aspectos de la Ley de Impuesto al Valor Agregado, incluyendo nuevas exenciones y procedimientos de declaración.',
      filename: 'Ley_20_899_IVA.pdf',
      score: 0.95
    },
    {
      id: 'ID002',
      title: 'Decreto 123 - Reglamento de Renta',
      type: 'decreto',
      date: '2023-12-20',
      year: 2023,
      summary: 'Decreto que establece el reglamento para la aplicación de la Ley de Impuesto a la Renta, incluyendo procedimientos y plazos.',
      filename: 'Decreto_123_Renta.pdf',
      score: 0.88
    },
    {
      id: 'ID003',
      title: 'Resolución 456 - Procedimientos Administrativos',
      type: 'resolucion',
      date: '2023-11-10',
      year: 2023,
      summary: 'Resolución que establece los procedimientos administrativos para el manejo de documentos y trámites del SII.',
      filename: 'Resolucion_456_Procedimientos.pdf',
      score: 0.82
    },
    {
      id: 'ID004',
      title: 'Ley 21.210 - Modernización Tributaria',
      type: 'ley',
      date: '2022-08-15',
      year: 2022,
      summary: 'Ley de modernización tributaria que introduce cambios significativos en el sistema tributario chileno.',
      filename: 'Ley_21_210_Modernizacion.pdf',
      score: 0.90
    },
    {
      id: 'ID005',
      title: 'Decreto 789 - Reglamento de Extranjeros',
      type: 'decreto',
      date: '2022-06-30',
      year: 2022,
      summary: 'Decreto que regula los aspectos tributarios para personas extranjeras que realizan actividades en Chile.',
      filename: 'Decreto_789_Extranjeros.pdf',
      score: 0.75
    },
    {
      id: 'ID006',
      title: 'Resolución 101 - Circular Informativa',
      type: 'resolucion',
      date: '2021-09-25',
      year: 2021,
      summary: 'Circular informativa sobre cambios en los procedimientos de declaración y pago de impuestos.',
      filename: 'Resolucion_101_Circular.pdf',
      score: 0.70
    },
    {
      id: 'ID007',
      title: 'Ley 20.780 - Reforma Tributaria',
      type: 'ley',
      date: '2021-05-12',
      year: 2021,
      summary: 'Ley que introduce la reforma tributaria más importante de los últimos años, modificando múltiples aspectos del sistema.',
      filename: 'Ley_20_780_Reforma.pdf',
      score: 0.92
    },
    {
      id: 'ID008',
      title: 'Decreto 234 - Reglamento de Adquisiciones',
      type: 'decreto',
      date: '2020-12-18',
      year: 2020,
      summary: 'Decreto que establece las normas para las adquisiciones públicas y su tratamiento tributario.',
      filename: 'Decreto_234_Adquisiciones.pdf',
      score: 0.68
    }
  ]

  // Filtrar documentos basándose en los criterios de búsqueda
  let documentosFiltrados = [...documentosBase]

  // Filtro por título
  if (filtros.titulo && filtros.titulo.trim()) {
    const tituloLower = filtros.titulo.toLowerCase()
    documentosFiltrados = documentosFiltrados.filter(doc => 
      doc.title.toLowerCase().includes(tituloLower) ||
      doc.summary.toLowerCase().includes(tituloLower)
    )
  }

  // Filtro por tipo
  if (filtros.tipo && filtros.tipo.trim()) {
    documentosFiltrados = documentosFiltrados.filter(doc => 
      doc.type === filtros.tipo
    )
  }

  // Filtro por año
  if (filtros.year && filtros.year.trim()) {
    const year = parseInt(filtros.year)
    documentosFiltrados = documentosFiltrados.filter(doc => 
      doc.year === year
    )
  }

  // Filtro por fecha desde
  if (filtros.fechaDesde && filtros.fechaDesde.trim()) {
    documentosFiltrados = documentosFiltrados.filter(doc => 
      doc.date >= filtros.fechaDesde
    )
  }

  // Filtro por fecha hasta
  if (filtros.fechaHasta && filtros.fechaHasta.trim()) {
    documentosFiltrados = documentosFiltrados.filter(doc => 
      doc.date <= filtros.fechaHasta
    )
  }

  // Ordenar por score descendente
  documentosFiltrados.sort((a, b) => b.score - a.score)

  return documentosFiltrados
}


// Buscar todos los documentos
async function buscarTodos() {
    logger.user('Buscando todos los documentos - limpiando filtros')
    filtros.value = {
        titulo: '',
        tipo: '',
        year: '',
        fechaDesde: '',
        fechaHasta: ''
    }
    await buscar()
}

// Buscar por año específico
async function buscarPorYear(year) {
  logger.user(`Buscando documentos del año: ${year}`)
  filtros.value.year = year
  filtros.value.titulo = '' // Limpiar otros filtros para búsqueda por año
  filtros.value.tipo = ''
  await buscar()
}

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
  
  // Limpiar resultados y estado de búsqueda
  resultados.value = []
  hasSearched.value = false
  
  // Mostrar notificación de confirmación
  info('Filtros limpiados correctamente', 'Filtros limpiados')
}

// Función para buscar solo por año
async function buscarSoloPorAño() {
  if (!filtros.value.year) {
    warning('Por favor selecciona un año para buscar', 'Año requerido')
    return
  }
  
  logger.user(`Búsqueda específica por año: ${filtros.value.year}`)
  filtros.value.titulo = ''
  filtros.value.tipo = ''
  await buscar()
}

// Buscar documento por ID
async function buscarPorId(documentId) {
    isSearching.value = true

    logger.search(`Buscando documento por ID: ${documentId}`)

    try {
        console.log('🔍 Buscando documento por ID:', documentId)

        const url = `${API_BASE_URL}/api/search/documents/id/${documentId}`
        logger.api('Enviando request para buscar por ID', { url, documentId })

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('📥 Documento encontrado:', data)

        logger.api('Documento encontrado por ID', { documentId, found: !!data })

        // Mapear el documento encontrado al formato esperado
        const documentoMapeado = {
            id: data.documentId || data.id || documentId,
            title: data.title || 'Sin título',
            type: extraerTipoDocumento(data.title || data.filename),
            date: formatearFecha(data.lastModified),
            year: data.year,
            summary: data.snippet || 'Sin resumen disponible',
            filename: data.filename,
            score: data.score || 1.0
        }

        // Mostrar el documento encontrado
        resultados.value = [documentoMapeado]

        logger.success(`Documento ${documentId} encontrado y mostrado`)

    } catch (error) {
        console.error('❌ Error buscando por ID:', error)
        logger.error('Error buscando documento por ID', { documentId, error: error.message })
        error('No se pudo encontrar el documento con ese ID.', 'Documento no encontrado')
    } finally {
        isSearching.value = false
        logger.info('Búsqueda por ID finalizada')
    }
}

// Ver documento específico
function verDocumento(documentId) {
    console.log('👁️ Ver documento:', documentId)
    logger.user(`Solicitando ver documento: ${documentId}`)
    // Aquí podrías abrir un modal o navegar a una página de detalle
    info(`Ver documento con ID: ${documentId}`, 'Ver documento')
}

// Chatear con documento específico
async function chatearConDocumento(documento) {
  logger.user(`Iniciando chat con documento: ${documento.title}`)

  try {
    // Crear nueva sesión para el documento
    const nuevaSesion = await crearSesionParaDocumento(documento)

    if (nuevaSesion) {
      // Emitir evento para abrir el chat con el documento
      emit('abrirChatConDocumento', {
        documento: documento,
        sessionId: nuevaSesion,
        mensajeInicial: `Chat iniciado con documento: ${documento.title}`
      })

      logger.success(`Chat iniciado con documento: ${documento.title}`)
      
      // Mostrar mensaje de confirmación
      success(`Chat abierto con el documento: ${documento.title}`, 'Chat iniciado')
    } else {
      logger.error('No se pudo crear sesión para el documento')
      error('No se pudo iniciar el chat con este documento. Por favor, intenta de nuevo.', 'Error al iniciar chat')
    }

  } catch (error) {
    logger.error('Error iniciando chat con documento', {
      documento: documento.title,
      error: error.message
    })
    error('Error al iniciar el chat con el documento. Por favor, intenta de nuevo.', 'Error al iniciar chat')
  }
}

// Crear sesión específica para un documento
async function crearSesionParaDocumento(documento) {
    logger.api('Preparando chat con documento específico', { documento: documento.title })
    
    try {
        // Como la API de sesiones no está disponible, usamos la sesión existente del chat
        // y simulamos que el documento está disponible para chatear
        const sessionId = 'documento-' + documento.id + '-' + Date.now()
        
        logger.api('Sesión simulada creada para documento', { sessionId, documento: documento.title })
        
        return sessionId
        
    } catch (error) {
        logger.error('Error preparando chat con documento', { error: error.message })
        return null
    }
}

// Preparar documento para chat (versión simplificada)
async function subirDocumentoASesion(sessionId, documento) {
    logger.api('Preparando documento para chat', { 
        sessionId, 
        documento: documento.title,
        filename: documento.filename 
    })
    
    try {
        // Simulamos que el documento está disponible para chatear
        // En una implementación real, aquí subirías el PDF a la API de chat
        logger.success(`Documento preparado para chat: ${documento.title}`)
        
        return {
            id: documento.id,
            name: documento.filename || documento.title,
            status: 'ready_for_chat'
        }
        
    } catch (error) {
        logger.error('Error preparando documento para chat', { 
            sessionId, 
            documento: documento.title, 
            error: error.message 
        })
        throw error
    }
}

// Cargar estadísticas
async function cargarStats() {
    // El endpoint de estadísticas no está disponible en tu API
    // Se mantiene stats como null para evitar errores
    console.log('📊 Endpoint de estadísticas no disponible en esta API')
    logger.info('Endpoint de estadísticas no disponible en esta API')
    stats.value = null
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return ''
    
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch (error) {
        return dateString
    }
}

// Formatear fecha desde timestamp
function formatearFecha(timestamp) {
    if (!timestamp) return ''
    
    try {
        // Convertir timestamp a fecha
        const date = new Date(parseInt(timestamp))
        return date.toISOString().split('T')[0] // Formato YYYY-MM-DD
    } catch (error) {
        return ''
    }
}

// Extraer tipo de documento del título
function extraerTipoDocumento(titulo) {
    if (!titulo) return 'documento'
    
    const tituloLower = titulo.toLowerCase()
    
    if (tituloLower.includes('ley')) return 'ley'
    if (tituloLower.includes('decreto')) return 'decreto'
    if (tituloLower.includes('resolución') || tituloLower.includes('resolucion')) return 'resolucion'
    if (tituloLower.includes('circular')) return 'circular'
    if (tituloLower.includes('instrucción') || tituloLower.includes('instruccion')) return 'instruccion'
    
    return 'documento'
}

// Cargar estadísticas al montar el componente
onMounted(() => {
    logger.system('Componente BuscadorNormativo montado')
    cargarStats()
})

// Definir emits
const emit = defineEmits(['hideChat', 'abrirChatConDocumento'])
</script>

<style scoped>
.buscador-normativo {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.filtros {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    align-items: center;
}

.filtros input,
.filtros select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.filtros input:focus,
.filtros select:focus {
    outline: none;
    border-color: #003366;
    box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.1);
}

.filtros button {
    padding: 0.5rem 1rem;
    background: #003366;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
}

.filtros button:hover:not(:disabled) {
    background: #004080;
}

.filtros button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year-select {
  padding: 0.5rem;
  border: 2px solid #003366;
  border-radius: 6px;
  font-size: 14px;
  background: #f8f9fa;
  color: #003366;
  font-weight: 500;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.year-select:hover {
  background: #e9ecef;
  border-color: #004080;
}

.year-select:focus {
  outline: none;
  border-color: #004080;
  box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
  background: white;
}

.year-select option {
  background: white;
  color: #333;
  padding: 0.5rem;
}

.year-select optgroup {
  background: #f8f9fa;
  color: #003366;
  font-weight: 600;
  font-size: 12px;
}

.year-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-year-current,
.btn-year-last {
  padding: 0.4rem 0.6rem;
  border: 1px solid #003366;
  border-radius: 4px;
  background: #003366;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-year-current:hover,
.btn-year-last:hover {
  background: #004080;
  border-color: #004080;
  transform: translateY(-1px);
}

.btn-year-current:active,
.btn-year-last:active {
  transform: translateY(0);
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

.btn-clear:hover:not(:disabled) {
  background: #c82333;
}

.btn-clear:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #003366;
}

.stat-item {
  font-size: 14px;
  color: #666;
}

.filtros-aplicados {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.filtros-aplicados strong {
  color: #003366;
  font-size: 13px;
}

.filtro-tag {
  background: #e3f2fd;
  color: #003366;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #bbdefb;
}

.resultados {
    flex: 1;
    min-height: 400px;
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    color: #666;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #003366;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.no-results {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.no-results p {
    margin-bottom: 1rem;
}

.btn-secondary {
    padding: 0.5rem 1rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
}

.btn-secondary:hover {
    background: #5a6268;
}

.btn-chat {
    padding: 0.5rem 1rem;
    background: #ff5100;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
}

.btn-chat:hover {
    background: #e64700;
}

.document-list {
    list-style: none;
    padding: 0;
}

.document-item {
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
}

.document-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.document-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.document-title {
    margin: 0;
    font-size: 18px;
    color: #003366;
    flex: 1;
}

.document-type {
    background: #003366;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 12px;
    text-transform: uppercase;
    margin-left: 1rem;
}

.document-score {
    background: #28a745;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 12px;
    margin-left: 0.5rem;
}

.document-filename {
    background: #6c757d;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 11px;
    margin-left: 0.5rem;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.document-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    font-size: 14px;
    color: #666;
}

.document-summary {
    margin-bottom: 1rem;
    color: #555;
    line-height: 1.5;
}

.document-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-primary {
    padding: 0.5rem 1rem;
    background: #003366;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
}

.btn-primary:hover {
    background: #004080;
}

/* Responsive */
@media (max-width: 768px) {
    .filtros {
        flex-direction: column;
        align-items: stretch;
    }
    
    .document-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .document-type {
        margin-left: 0;
        margin-top: 0.5rem;
    }
    
    .document-actions {
        flex-direction: column;
    }
}
</style>