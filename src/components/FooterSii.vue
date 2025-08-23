<template>
    <footer class="sii-footer">
        <div class="footer-content">
            <!-- Using both logos for demonstration, you can choose one 
            <img src="https://www.sii.cl/images/logo_sii.png" alt="Servicio de Impuestos Internos" class="sii-logo" />
            -->
            <img src="../assets/logoSII.jpg" alt="Servicio de Impuestos Internos" class="sii-logo" />
            <div class="footer-text">
                <p>
                    © {{ new Date().getFullYear() }} Servicio de Impuestos Internos de Chile. Todos los derechos reservados.
                </p>
                <p>
                    Sitio web oficial: 
                    <a href="https://www.sii.cl" target="_blank" rel="noopener">www.sii.cl</a>
                </p>
                <p>
                    Consultas: 
                    <a href="mailto:consultas@sii.cl">consultas@sii.cl</a>
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup>
// No script logic needed for static footer
</script>

<style scoped>
.sii-footer {
    background: #003366;
    color: #fff;
    padding: 24px 0;
    text-align: center;
    font-size: 15px;
}

.footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.sii-logo {
    width: 120px;
    margin-bottom: 8px;
}

.footer-text a {
    color: #ffcc00;
    text-decoration: underline;
}

.footer-text p {
    margin: 4px 0;
}
</style>