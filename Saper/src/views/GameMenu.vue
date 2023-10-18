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
    <div :class="gridColsNum" class="grid gap-2 justify-center">
      <div
        v-for="index in totalNumberOfSegments"
        :key="index"
        class="border border-solid border-black rounded-lg p-6 flex justify-center"
        :class="{
          'bg-red-500': isBombUncovered(index),
          'bg-slate-600': !isBombUncovered(index)
        }"
        role="button"
        @click="clickOnSegment(index)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'

const numberOfXSegments = ref(8)
const numberOfYSegments = ref(8)
const numberOfMines = ref(10)

const bombSegmentObjects: Ref<{ index: number; clicked: boolean }[]> = ref([])

// onMounted(() => GenerateSegments())

const totalNumberOfSegments = computed(() => {
  let numberOfAllSegments = numberOfXSegments.value * numberOfYSegments.value

  return numberOfAllSegments
})

onMounted(() => GenerateBombSegments())

const clickOnSegment = (index: number) => {
  if (!isBomb(index)) return

  const found = bombSegmentObjects.value.find((e) => e.index === index)
  if (found) found.clicked = true
}

const isBomb = (index: number) => {
  if (bombSegmentObjects.value.find((e) => e.index === index)) return true
}

const isBombUncovered = (index: number) => {
  if (!isBomb(index)) return

  if (bombSegmentObjects.value.find((e) => e.clicked === true && e.index === index)) return true
}

function checkIfOccupyed(index: number, pastIndexes: number[]) {
  if (pastIndexes.includes(index)) {
    return true
  } else return false
}

function checkIfNumberIsUnique(index: number, pastIndexes: number[]) {
  if (!checkIfOccupyed(index, pastIndexes)) {
    return true
  } else return false
}

function GenerateBombSegments() {
  let i = 0
  let pastIndexes: number[] = []
  let randomIndex: number = 0

  while (i < numberOfMines.value) {
    randomIndex = Math.floor(Math.random() * totalNumberOfSegments.value)
    if (checkIfNumberIsUnique(randomIndex, pastIndexes)) {
      pastIndexes.push(randomIndex)
      i++
    } else if (!pastIndexes.length) {
      pastIndexes.push(randomIndex)
      i++
    }
  }
  for (const elem in pastIndexes) {
    const newElement = { index: pastIndexes[elem], clicked: false }
    bombSegmentObjects.value.push(newElement)
  }
}

const gridColsNum = computed(() => {
  return [`grid-rows-${numberOfXSegments.value}`, `grid-cols-${numberOfYSegments.value}`]
})

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
