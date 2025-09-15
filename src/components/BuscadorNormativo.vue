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
            <input 
                type="number" 
                v-model="filtros.year" 
                placeholder="Año específico" 
                min="1900" 
                max="2030"
            />
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
            <button @click="buscar" :disabled="isSearching">
                <span v-if="!isSearching">🔍 Buscar</span>
                <span v-else>⏳ Buscando...</span>
            </button>
        </div>
        
        <!-- Estadísticas de búsqueda -->
        <div v-if="stats" class="stats">
            <div class="stat-item">
                <strong>{{ stats.total_documents || 0 }}</strong> documentos disponibles
            </div>
            <div class="stat-item">
                <strong>{{ resultados.length }}</strong> resultados encontrados
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
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API_CONFIG, buildApiUrl, checkApiHealth } from '../config/api.js'

// Configuración de la API
const API_BASE_URL = API_CONFIG.BASE_URL

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

// Función para manejar clicks en el buscador
function handleBuscadorClick() {
    emit('hideChat')
}

// Función principal de búsqueda
async function buscar() {
    if (isSearching.value) return
    
    isSearching.value = true
    hasSearched.value = true
    
    try {
        console.log('🔍 Iniciando búsqueda con filtros:', filtros.value)
        
        // Construir parámetros de búsqueda para tu API
        const params = new URLSearchParams()
        
        // Tu API usa 'query' como parámetro principal
        if (filtros.value.titulo) {
            params.append('query', filtros.value.titulo)
        }
        
        // Agregar límite de resultados
        params.append('limit', '10')
        
        // Si hay otros filtros, los agregamos como parámetros adicionales
        if (filtros.value.year) {
            params.append('year', filtros.value.year)
        }
        
        const url = `${API_BASE_URL}/api/search/documents?${params.toString()}`
        console.log('📡 URL de búsqueda:', url)
        
        const response = await fetch(url)
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('📥 Resultados recibidos:', data)
        
        // Tu API devuelve los resultados en 'results'
        if (data.results && Array.isArray(data.results)) {
            // Mapear los resultados de tu API al formato esperado por el frontend
            resultados.value = data.results.map(doc => ({
                id: doc.documentId || doc.id,
                title: doc.title,
                type: extraerTipoDocumento(doc.title),
                date: formatearFecha(doc.lastModified),
                year: doc.year,
                summary: doc.snippet,
                filename: doc.filename,
                score: doc.score
            }))
        } else {
            resultados.value = []
        }
        
    } catch (error) {
        console.error('❌ Error en búsqueda:', error)
        
        // Datos de prueba mientras la API no esté disponible
        console.log('🔄 Usando datos de prueba...')
        resultados.value = generarDatosPrueba()
        
        // Mostrar mensaje informativo
        setTimeout(() => {
            alert('⚠️ API no disponible. Mostrando datos de prueba.\n\nPara conectar con tu API real, asegúrate de que esté corriendo en el puerto correcto.')
        }, 1000)
        
    } finally {
        isSearching.value = false
    }
}

// Función para generar datos de prueba
function generarDatosPrueba() {
    const documentosPrueba = [
        {
            id: 'doc_001',
            title: 'Ley 20.899 - Modifica Ley de IVA',
            type: 'ley',
            date: '2022-01-15',
            year: 2022,
            summary: 'Esta ley modifica el Impuesto al Valor Agregado en relación a la venta de bienes inmuebles y contratos de arriendo con opción de compra.'
        },
        {
            id: 'doc_002',
            title: 'Decreto Supremo N° 123 - Reglamento de Salud',
            type: 'decreto',
            date: '2023-03-10',
            year: 2023,
            summary: 'Establece las normas y procedimientos para la aplicación de políticas de salud pública en el territorio nacional.'
        },
        {
            id: 'doc_003',
            title: 'Resolución Exenta N° 456 - Normas Ambientales',
            type: 'resolucion',
            date: '2021-11-05',
            year: 2021,
            summary: 'Define los estándares ambientales para la industria manufacturera y los procedimientos de evaluación de impacto ambiental.'
        },
        {
            id: 'doc_004',
            title: 'Ley 21.100 - Protección de Datos Personales',
            type: 'ley',
            date: '2023-08-20',
            year: 2023,
            summary: 'Regula el tratamiento y protección de datos personales en el ámbito público y privado, estableciendo derechos y obligaciones.'
        },
        {
            id: 'doc_005',
            title: 'Decreto Ley N° 789 - Reforma Tributaria',
            type: 'decreto',
            date: '2022-12-01',
            year: 2022,
            summary: 'Introduce modificaciones al sistema tributario nacional, incluyendo cambios en las tasas impositivas y procedimientos de recaudación.'
        }
    ]
    
    // Filtrar según los criterios de búsqueda
    return documentosPrueba.filter(doc => {
        const coincideTitulo = !filtros.value.titulo || 
            doc.title.toLowerCase().includes(filtros.value.titulo.toLowerCase())
        const coincideTipo = !filtros.value.tipo || doc.type === filtros.value.tipo
        const coincideYear = !filtros.value.year || doc.year.toString() === filtros.value.year
        const coincideFechaDesde = !filtros.value.fechaDesde || doc.date >= filtros.value.fechaDesde
        const coincideFechaHasta = !filtros.value.fechaHasta || doc.date <= filtros.value.fechaHasta
        
        return coincideTitulo && coincideTipo && coincideYear && coincideFechaDesde && coincideFechaHasta
    })
}

// Buscar todos los documentos
async function buscarTodos() {
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
    filtros.value.year = year
    await buscar()
}

// Buscar documento por ID
async function buscarPorId(documentId) {
    isSearching.value = true
    
    try {
        console.log('🔍 Buscando documento por ID:', documentId)
        
        const response = await fetch(`${API_BASE_URL}/api/search/documents/id/${documentId}`)
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('📥 Documento encontrado:', data)
        
        // Mostrar el documento encontrado
        resultados.value = [data.document || data]
        
    } catch (error) {
        console.error('❌ Error buscando por ID:', error)
        alert('No se pudo encontrar el documento con ese ID.')
    } finally {
        isSearching.value = false
    }
}

// Ver documento específico
function verDocumento(documentId) {
    console.log('👁️ Ver documento:', documentId)
    // Aquí podrías abrir un modal o navegar a una página de detalle
    alert(`Ver documento con ID: ${documentId}`)
}

// Cargar estadísticas
async function cargarStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/search/stats`)
        
        if (response.ok) {
            const data = await response.json()
            stats.value = data
            console.log('📊 Estadísticas cargadas:', data)
        }
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error)
        
        // Estadísticas de prueba
        stats.value = {
            total_documents: 5,
            documents_by_type: {
                ley: 2,
                decreto: 2,
                resolucion: 1
            },
            last_updated: new Date().toISOString()
        }
        console.log('📊 Usando estadísticas de prueba')
    }
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
    cargarStats()
})

// Definir emits
const emit = defineEmits(['hideChat'])
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