// Sistema de logging para el Buscador Normativo - Solo Consola
class Logger {
  constructor() {
    // Solo logging en consola, sin almacenamiento en memoria
  }

  // Método principal para agregar logs
  log(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString('es-CL')
    
    // Mostrar en consola del navegador
    this.consoleLog(level, message, data, timestamp)
  }

  // Mostrar en consola del navegador con colores
  consoleLog(level, message, data, timestamp) {
    const styles = {
      'info': 'color: #0066cc',
      'success': 'color: #00aa00',
      'warning': 'color: #ff8800',
      'error': 'color: #cc0000',
      'search': 'color: #6600cc',
      'api': 'color: #0066aa',
      'user': 'color: #aa0066',
      'system': 'color: #666666'
    }

    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'search': '🔍',
      'api': '📡',
      'user': '👤',
      'system': '⚙️'
    }

    console.log(
      `%c${emoji[level] || '📝'} [${timestamp}] ${message}`,
      styles[level] || 'color: #000000',
      data || ''
    )
  }

  // Métodos específicos para diferentes tipos de logs
  info(message, data = null) {
    return this.log('info', message, data)
  }

  success(message, data = null) {
    return this.log('success', message, data)
  }

  warning(message, data = null) {
    return this.log('warning', message, data)
  }

  error(message, data = null) {
    return this.log('error', message, data)
  }

  search(message, data = null) {
    return this.log('search', message, data)
  }

  api(message, data = null) {
    return this.log('api', message, data)
  }

  user(message, data = null) {
    return this.log('user', message, data)
  }

  system(message, data = null) {
    return this.log('system', message, data)
  }

  // Métodos simplificados para compatibilidad
  getLogs() {
    return [] // Sin almacenamiento en memoria
  }

  clearLogs() {
    console.clear()
    this.system('Consola limpiada')
  }

  exportLogs() {
    console.log('📤 Para exportar logs, usa la función "Guardar como" de la consola del navegador')
  }
}

// Crear instancia global del logger
const logger = new Logger()

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.logger = logger
}

export default logger
