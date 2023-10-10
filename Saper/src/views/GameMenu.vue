<template>
  <div class="flex justify-center p-4">
    <div class="grid gap-4 grid-rows-1 grid-cols-3 bg-slate-400 justify-center">
      <div
        class="border border-solid border-black bg-slate-800 text-red-700 p-2 border-spacing-2 lining-nums text-xl"
      >
        10:00
      </div>
      <div
        class="border border-solid border-black border-spacing-2 p-2 flex justify-center"
        role="button"
        @click="GameReset"
      >
        {{ gameEmoji }}
      </div>
      <div
        class="p-2 border-spacing-2 border border-solid border-black bg-slate-800 text-red-700 flex justify-center lining-nums text-xl"
      >
        {{ mineCoversLeft.toString().padStart(3, '0') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'

let gameEmoji = '😊'
let mineCoversLeft: Ref<number> = ref(10)
const timeLeft = {
  minutes: 10,
  seconds: 0
}

let mineCoversLeftString = ref(mineCoversLeft.value.toString().padStart(3, '0'))

const GameReset = () => {
  console.log('Placeholder')
  mineCoversLeft.value--
}
</script>
