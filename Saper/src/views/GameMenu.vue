<template>
  <div class="flex justify-center p-4">
    <div class="grid gap-4 grid-rows-1 grid-cols-3 bg-slate-400 justify-center">
      <div
        class="border border-solid border-black bg-slate-800 text-red-700 p-2 border-spacing-2 lining-nums text-xl"
      >
        {{
          `${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds
            .toString()
            .padStart(2, '0')}`
        }}
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

  <div class="flex justify-center">
    <div :class="gridColsNum">
      <div v-for="seg in gameSegments" :key="seg.id" :id="String(seg.id)" :class="seg.styles">
        {{ seg.sign }}
      </div>
    </div>
  </div>
  <!-- <div class="grid justify-center" :class="{grid-rows-{{ numberOfXSegments }}}"></div> -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'

type Segment = { id: number; styles: string; isABomb: boolean; sign: string }

const numberOfXSegments = ref(8)
const numberOfYSegments = ref(8)
const numberOfMines = ref(10)
const gameSegments: Ref<Segment[]> = ref([])

onMounted(() => GenerateSegments())

function GenerateSegments() {
  let idNr = 0
  for (let i = 1; i < numberOfXSegments.value + 1; i++) {
    for (let j = 1; j < numberOfYSegments.value + 1; j++) {
      const Segment: Segment = {
        id: idNr,
        styles: 'border border-solid border-black bg-slate-600 rounded-lg p-6 flex justify-center',
        isABomb: false,
        sign: ''
      }
      gameSegments.value.push(Segment)

      idNr++
    }
  }
  GenerateBombSegments()
}

function checkIfOccupyed(index: number, pastIndexes: number[]) {
  if (pastIndexes.includes(index)) {
    return true
  } else return false
}

function checkIfUnique(index: number, pastIndexes: number[]) {
  if (!checkIfOccupyed(index, pastIndexes)) {
    return true
  } else return false
}

function changeBombStates(indexList: number[]) {
  for (let num in indexList) {
    let newIndex = indexList[num]
    gameSegments.value[newIndex].isABomb = true
    gameSegments.value[newIndex].styles =
      'border border-solid border-black bg-red-500 rounded-lg p-6 flex justify-center'
  }
}

function GenerateBombSegments() {
  let i = 0
  let pastIndexes: number[] = []
  let randomIndex: number = 0

  while (i < numberOfMines.value) {
    randomIndex = Math.floor(Math.random() * gameSegments.value.length)
    if (checkIfUnique(randomIndex, pastIndexes)) {
      console.log('Unique checking')

      console.log('number ' + randomIndex)
      pastIndexes.push(randomIndex)
      i++
    } else if (!pastIndexes) {
      console.log('First one')
      console.log('number ' + randomIndex)
      pastIndexes.push(randomIndex)
      i++
    }
  }
  changeBombStates(pastIndexes)
}

const gridColsNum = computed(() => {
  let numberOfRows = 'grid-rows-' + String(numberOfXSegments.value)
  let numberOfCols = 'grid-cols-' + String(numberOfYSegments.value)
  console.log(numberOfCols)
  console.log(typeof numberOfCols)

  return 'grid gap-2 justify-center' + ' ' + numberOfRows + ' ' + numberOfCols
})

// ${String(numberOfXSegments.value)}

const gameEmoji: Ref<string> = ref('😊')
let mineCoversLeft: Ref<number> = ref(10)

const timeLeft: Ref<{ minutes: number; seconds: number }> = ref({
  minutes: 10,
  seconds: 0
})

const gameState: Ref<{ gameStarted: boolean; gameLoose: boolean; gameEnded: boolean }> = ref({
  gameStarted: false,
  gameLoose: false,
  gameEnded: false
})

function gameOver() {
  gameState.value.gameLoose = true
  gameState.value.gameEnded = true
  gameState.value.gameStarted = false
  gameEmoji.value = '😔'
}

const GameReset = () => {
  if (gameState.value.gameStarted) {
    mineCoversLeft.value--
    timeLeft.value.minutes--
  } else if (
    !gameState.value.gameStarted &&
    !gameState.value.gameEnded &&
    (timeLeft.value.minutes > 0 || timeLeft.value.seconds > 0)
  ) {
    gameState.value.gameStarted = true
  }

  if (timeLeft.value.minutes === 0 && timeLeft.value.seconds === 0 && gameState.value.gameStarted) {
    gameOver()
  }
}
</script>
