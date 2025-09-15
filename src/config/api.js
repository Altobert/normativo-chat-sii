// Configuración de la API
export const API_CONFIG = {
  // URL base de la API - Usando proxy de Vite para evitar CORS
  BASE_URL: '', // Vite proxy manejará las rutas /api
  
  // Endpoints de búsqueda
  ENDPOINTS: {
    SEARCH_DOCUMENTS: '/api/search/documents',
    SEARCH_BY_ID: '/api/search/documents/id',
    SEARCH_BY_YEAR: '/api/search/documents/year',
    STATS: '/api/search/stats'
  },
  
  // Configuración de timeout
  TIMEOUT: 10000, // 10 segundos
  
  // Modo de desarrollo (muestra datos de prueba si la API no está disponible)
  DEVELOPMENT_MODE: false
}

// Función para construir URLs completas
export function buildApiUrl(endpoint, params = {}) {
  const url = new URL(API_CONFIG.BASE_URL + endpoint)
  
  // Agregar parámetros de consulta
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key])
    }
  })
  
  return url.toString()
}

// Función para verificar si la API está disponible
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      timeout: API_CONFIG.TIMEOUT
    })
    return response.ok
  } catch (error) {
    console.error('API no disponible:', error)
    return false
  }
}
