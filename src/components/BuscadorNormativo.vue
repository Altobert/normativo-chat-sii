<template>
    <div class="buscador-normativo">
        <div class="filtros">
            <input v-model="filtros.titulo" placeholder="Buscar por título..." />
            <select v-model="filtros.tipo">
                <option value="">Todos los tipos</option>
                <option value="ley">Ley</option>
                <option value="decreto">Decreto</option>
                <option value="resolucion">Resolución</option>
            </select>
            <input type="date" v-model="filtros.fechaDesde" placeholder="Desde" />
            <input type="date" v-model="filtros.fechaHasta" placeholder="Hasta" />
            <button @click="buscar">Buscar</button>
        </div>
        <div class="resultados">
            <div v-if="resultados.length === 0">No se encontraron documentos.</div>
            <ul v-else>
                <li v-for="doc in resultados" :key="doc.id">
                    <strong>{{ doc.titulo }}</strong> ({{ doc.tipo }}) - {{ doc.fecha }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const documentos = [
    { id: 1, titulo: 'Ley de Educación', tipo: 'ley', fecha: '2022-01-15' },
    { id: 2, titulo: 'Decreto de Salud', tipo: 'decreto', fecha: '2023-03-10' },
    { id: 3, titulo: 'Resolución Ambiental', tipo: 'resolucion', fecha: '2021-11-05' },
    // Agrega más documentos de ejemplo aquí
]

const filtros = ref({
    titulo: '',
    tipo: '',
    fechaDesde: '',
    fechaHasta: ''
})

const resultados = ref([...documentos])

function buscar() {
    resultados.value = documentos.filter(doc => {
        const coincideTitulo = filtros.value.titulo === '' ||
            doc.titulo.toLowerCase().includes(filtros.value.titulo.toLowerCase())
        const coincideTipo = filtros.value.tipo === '' || doc.tipo === filtros.value.tipo
        const coincideFechaDesde = !filtros.value.fechaDesde || doc.fecha >= filtros.value.fechaDesde
        const coincideFechaHasta = !filtros.value.fechaHasta || doc.fecha <= filtros.value.fechaHasta
        return coincideTitulo && coincideTipo && coincideFechaDesde && coincideFechaHasta
    })
}
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
}
.resultados {
    flex: 1;
    min-height: 400px;
}
.resultados ul {
    list-style: none;
    padding: 0;
}
.resultados li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #0a9fe9;
}
</style>