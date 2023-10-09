<template>
  <header></header>

  <body>
    <div class="pt-18">Placecholder</div>
    <div>
      <game-menu class="mt-24"></game-menu>
    </div>
  </body>

  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import GameMenu from './views/GameMenu.vue'
</script>
