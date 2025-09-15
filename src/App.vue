<script setup>
import HelloWorld from './components/HelloWorld.vue'
import HeaderSii from './components/HeaderSii.vue';
import Footer from './components/FooterSii.vue';
import BuscadorNormativo from './components/BuscadorNormativo.vue';
import ChatWindow from './components/ChatWindow.vue';
import { ref } from 'vue'

// Referencia al componente ChatWindow
const chatWindowRef = ref(null)

// Función para manejar el evento de esconder chat
const handleHideChat = () => {
    if (chatWindowRef.value) {
        chatWindowRef.value.hideChat()
    }
}

// Función para manejar el evento de abrir chat con documento
const handleAbrirChatConDocumento = (data) => {
    if (chatWindowRef.value) {
        chatWindowRef.value.abrirChatConDocumento(data)
    }
}
</script>

<template>
  <div class="container">
    <HeaderSii />
    <!--
    <HelloWorld msg="Vite + Vue" />
    -->

    <BuscadorNormativo @hideChat="handleHideChat" @abrirChatConDocumento="handleAbrirChatConDocumento" />
    <Footer />
    
        <!-- Chat Window -->
        <ChatWindow ref="chatWindowRef" />
    </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
