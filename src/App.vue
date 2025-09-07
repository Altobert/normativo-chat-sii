<script setup>
import HelloWorld from './components/HelloWorld.vue'
import HeaderSii from './components/HeaderSii.vue';
import Footer from './components/FooterSii.vue';
import BuscadorNormativo from './components/BuscadorNormativo.vue';
import ChatWindow from './components/ChatWindow.vue';
</script>

<template>
  <div class="container">
    <HeaderSii />
    <!--
    <HelloWorld msg="Vite + Vue" />
    -->

    <BuscadorNormativo />
    <Footer />
    
    <!-- Chat Window -->
    <ChatWindow />
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
