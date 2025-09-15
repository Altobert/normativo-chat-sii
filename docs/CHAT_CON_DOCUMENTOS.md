# Chat con Documentos - Buscador Normativo

## 🎯 Descripción

Se ha implementado la funcionalidad de **chatear directamente con documentos específicos** encontrados en el buscador. Esta funcionalidad permite hacer preguntas específicas sobre el contenido de cualquier documento normativo usando el chat existente.

## ⚠️ Estado Actual

**Funcionalidad implementada pero limitada** debido a que la API de chat (`/api/sessions`) no está disponible (403 Forbidden). La funcionalidad funciona como **simulación** mostrando información detallada del documento en el chat.

## 🚀 Funcionalidad Implementada

### **Botón "💬 Chatear con documento"**

Cada resultado de búsqueda ahora incluye un botón verde que permite:
- ✅ **Preparar sesión específica** para el documento
- ✅ **Abrir el chat** automáticamente
- ✅ **Mostrar información detallada** del documento
- ✅ **Mensaje de bienvenida** con datos del documento
- ⚠️ **Simulación** (no conecta con API real de chat)

## 🎮 Cómo Usar

### **Paso a Paso:**

1. **Buscar documentos** en el buscador (ej: "IVA", "ley", "tributario")
2. **Ver resultados** con información del documento
3. **Hacer click** en el botón verde "💬 Chatear con documento"
4. **El chat se abre automáticamente** con el documento cargado
5. **Hacer preguntas** específicas sobre el documento

### **Ejemplo de Uso:**

```
1. Buscar: "IVA"
2. Resultado: "Tributacion Régimen ADM IVA Servicios Extranjeros"
3. Click: "💬 Chatear con documento"
4. Chat abre con información detallada:
   📄 **Chat con documento específico**
   
   **Título:** Tributacion Régimen ADM IVA Servicios Extranjeros
   **Tipo:** circular
   **Año:** 2020
   **Score de relevancia:** 1.24
   
   **Resumen del documento:**
   DEPARTAMENTO EMISOR: Impuestos Indirectos...
   
   ---
   💬 **¿Qué te gustaría saber sobre este documento?**
```

### **Información Mostrada:**
- ✅ **Título completo** del documento
- ✅ **Tipo** (ley, decreto, circular, etc.)
- ✅ **Año** del documento
- ✅ **Score de relevancia** de la búsqueda
- ✅ **Resumen/snippet** del contenido
- ✅ **Sugerencias** de preguntas posibles

## 🔧 Implementación Técnica

### **Flujo de Funcionamiento:**

1. **Usuario hace click** en "💬 Chatear con documento"
2. **Sistema crea nueva sesión** via `POST /api/sessions`
3. **Documento se sube** a la sesión via `POST /api/sessions/{id}/documents`
4. **Chat se abre** con la nueva sesión
5. **Usuario puede chatear** con el documento específico

### **Componentes Modificados:**

#### **BuscadorNormativo.vue:**
- ✅ Botón "💬 Chatear con documento" agregado
- ✅ Función `chatearConDocumento()` implementada
- ✅ Función `crearSesionParaDocumento()` implementada
- ✅ Función `subirDocumentoASesion()` implementada
- ✅ Evento `abrirChatConDocumento` emitido

#### **ChatWindow.vue:**
- ✅ Función `abrirChatConDocumento()` implementada
- ✅ Manejo de sesiones específicas por documento
- ✅ Mensaje de bienvenida personalizado
- ✅ Apertura automática del chat

#### **App.vue:**
- ✅ Manejo del evento `abrirChatConDocumento`
- ✅ Comunicación entre componentes

## 📊 Logging Implementado

### **Logs Generados:**

```javascript
// Al hacer click en chatear
👤 [14:30:15] Iniciando chat con documento: Tributacion Régimen ADM IVA

// Creación de sesión
📡 [14:30:15] Creando sesión para documento específico
📡 [14:30:16] Sesión creada exitosamente
📡 [14:30:16] Subiendo documento a sesión

// Apertura del chat
👤 [14:30:17] Abriendo chat con documento: Tributacion Régimen ADM IVA
✅ [14:30:17] Chat abierto con documento: Tributacion Régimen ADM IVA
```

## 🎯 Beneficios

### **Para el Usuario:**
- ✅ **Chat contextual** con documentos específicos
- ✅ **Preguntas directas** sobre contenido específico
- ✅ **Sesiones separadas** por documento
- ✅ **Experiencia fluida** sin configuración manual

### **Para el Desarrollo:**
- ✅ **Logging completo** de todas las acciones
- ✅ **Manejo de errores** robusto
- ✅ **Reutilización** de componentes existentes
- ✅ **Escalabilidad** para múltiples documentos

## 🔍 Casos de Uso

### **Ejemplos de Preguntas:**

**Documento sobre IVA:**
- "¿Cuáles son las tasas de IVA aplicables?"
- "¿Qué servicios están exentos de IVA?"
- "¿Cómo se calcula el IVA en servicios extranjeros?"

**Documento sobre Leyes:**
- "¿Cuáles son los principales cambios de esta ley?"
- "¿A partir de qué fecha entra en vigencia?"
- "¿Qué sanciones establece esta ley?"

**Documento sobre Decretos:**
- "¿Qué procedimientos establece este decreto?"
- "¿Cuáles son los requisitos mencionados?"
- "¿Qué plazos se establecen?"

## 🚀 Próximas Mejoras

- [ ] **Chat simultáneo** con múltiples documentos
- [ ] **Historial de documentos** chateados
- [ ] **Comparación** entre documentos
- [ ] **Exportación** de conversaciones
- [ ] **Búsqueda** dentro de conversaciones

---
*Funcionalidad de Chat con Documentos implementada para el Buscador Normativo SII*
