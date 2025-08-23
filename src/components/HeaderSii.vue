<template>
    <header class="header-sii">
        <div class="header-content">
            <img src="../assets/logoSII.jpg" alt="SII Logo" class="sii-logo" />
            <h1 class="header-title">Buscador Normativo - Servicio de Impuestos Internos</h1>
        </div>
        <nav class="header-nav">
            <ul>
                <li><a href="https://www.sii.cl/" target="_blank" rel="noopener">Sitio SII</a></li>
                <li><a href="#">Normativas</a></li>
                <li><a href="#">Ayuda</a></li>
            </ul>
        </nav>
    </header>
</template>

<script setup>
// No script logic needed for static header
</script>

<style scoped>
.header-sii {
    background: #003366;
    color: #fff;
    padding: 0.5rem 2rem;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.sii-logo {
    height: 48px;
    width: auto;
}

.header-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.header-nav {
    margin-top: 0.5rem;
}

.header-nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
    padding: 0;
    margin: 0;
}

.header-nav a {
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.header-nav a:hover {
    color: #ffcc00;
}
</style>