# Funcionalidad "Chatear con Documento"

## 🎯 **Funcionalidades Implementadas**

### **1. Botón "Chatear con documento"**
- ✅ **Abre la ventana de chat** automáticamente
- ✅ **Muestra confirmación** al usuario
- ✅ **Integrado con el sistema de logging**

### **2. Chat con un solo documento a la vez**
- ✅ **Control de documento activo** único
- ✅ **Confirmación de cambio** si ya hay un documento activo
- ✅ **Limpieza automática** de conversación anterior

### **3. Respuestas específicas del documento**
- ✅ **Análisis contextual** basado en el documento activo
- ✅ **Respuestas personalizadas** según el contenido
- ✅ **Información específica** del documento seleccionado

### **4. Indicador visual del documento activo**
- ✅ **Header dinámico** que muestra el documento activo
- ✅ **Información del documento** (título, tipo, año)
- ✅ **Botón para cerrar** el documento activo

## 🚀 **Cómo Funciona**

### **Paso 1: Buscar Documento**
```
1. Usuario busca documentos (ej: "IVA")
2. Aparecen resultados en el buscador
3. Cada resultado tiene botón "💬 Chatear con documento"
```

### **Paso 2: Abrir Chat con Documento**
```
1. Click en "💬 Chatear con documento"
2. Se abre ventana de chat automáticamente
3. Aparece confirmación: "Chat abierto con el documento: [Título]"
4. Header del chat muestra información del documento
```

### **Paso 3: Chat Específico**
```
1. Chat muestra información detallada del documento
2. Respuestas son específicas del documento seleccionado
3. Usuario puede hacer preguntas contextuales
4. Indicador visual muestra documento activo
```

## 💬 **Tipos de Respuestas**

### **Respuestas Generales (Sin documento activo):**
- Guía para usar el buscador
- Información general sobre documentos normativos
- Instrucciones para encontrar documentos específicos

### **Respuestas Específicas (Con documento activo):**
- **IVA/Impuestos**: Información específica del documento sobre IVA
- **Procedimientos**: Pasos y procesos del documento
- **Fechas**: Información temporal específica
- **Requisitos**: Obligaciones y condiciones del documento
- **Contenido**: Resumen y detalles del documento

## 🎨 **Interfaz Visual**

### **Header del Chat:**
```
┌─────────────────────────────────────────┐
│ Chat de Proyectos Normativos del SII   │
│                                         │
│ 📄 Ley 20.899 Modifica Ley IVA         │
│    ley • 2023                    ✕      │
└─────────────────────────────────────────┘
```

### **Indicador de Documento Activo:**
- **Icono**: 📄
- **Título**: Nombre completo del documento
- **Metadatos**: Tipo y año
- **Botón cerrar**: ✕ (con confirmación)

## 🔧 **Funciones Técnicas**

### **`chatearConDocumento(documento)`**
- Crea sesión específica para el documento
- Emite evento para abrir chat
- Muestra confirmación al usuario
- Registra acción en logs

### **`abrirChatConDocumento(data)`**
- Verifica si ya hay documento activo
- Pide confirmación para cambiar documento
- Actualiza documento activo
- Limpia mensajes anteriores
- Muestra información del documento

### **`generarRespuestaEspecificaDocumento(mensaje, documento)`**
- Analiza el mensaje del usuario
- Genera respuestas basadas en el documento
- Incluye información específica del documento
- Proporciona sugerencias contextuales

### **`cerrarDocumentoActivo()`**
- Pide confirmación al usuario
- Limpia documento activo
- Resetea mensajes
- Vuelve al chat general

## 📊 **Logging Implementado**

### **Logs de Usuario:**
```javascript
👤 [14:35:20] Iniciando chat con documento: Ley 20.899 Modifica Ley IVA
👤 [14:35:25] Abriendo chat con documento: Ley 20.899 Modifica Ley IVA
👤 [14:35:30] Cerrando documento activo
```

### **Logs de Sistema:**
```javascript
✅ [14:35:21] Chat iniciado con documento: Ley 20.899 Modifica Ley IVA
✅ [14:35:26] Chat abierto con documento: Ley 20.899 Modifica Ley IVA
✅ [14:35:31] Documento activo cerrado
```

## 🎯 **Ejemplos de Uso**

### **Escenario 1: Chat con documento de IVA**
```
Usuario busca: "IVA"
Resultado: "Ley 20.899 Modifica Ley IVA"
Click: "💬 Chatear con documento"

Chat muestra:
📄 Chat con documento específico
Título: Ley 20.899 Modifica Ley IVA
Tipo: ley
Año: 2023
Score: 0.95

Usuario pregunta: "¿Qué modificaciones introduce?"
Respuesta: Basándome en el documento "Ley 20.899 Modifica Ley IVA" (ley, 2023), puedo ayudarte con información sobre las modificaciones...
```

### **Escenario 2: Cambio de documento**
```
Usuario ya chateando con: "Ley 20.899 Modifica Ley IVA"
Usuario click en otro documento: "Decreto 123"

Sistema pregunta:
"Ya estás chateando con el documento: 'Ley 20.899 Modifica Ley IVA'
¿Quieres cambiar al documento: 'Decreto 123'?
Esto cerrará la conversación actual."

Si confirma: Cambia al nuevo documento
Si cancela: Mantiene el documento actual
```

## 🔮 **Próximas Mejoras**

- [ ] **Historial de documentos** chateados
- [ ] **Favoritos** de documentos
- [ ] **Comparación** entre documentos
- [ ] **Exportar conversación** del chat
- [ ] **Búsqueda en conversación** actual
- [ ] **Respuestas más inteligentes** con IA

---
*Sistema de Chat con Documento implementado para el Buscador Normativo SII*
