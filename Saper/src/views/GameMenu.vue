<template>
  <minesweper-menu
    :coversLeft="mineCoversLeft"
    :Emoji="gameEmoji"
    :time="timeLeft"
    :Reset="GameReset"
    @dimention-change="changeGameParamsOnEmit"
  ></minesweper-menu>
  <div class="flex justify-center">
    <div :class="gridColsNum" class="grid gap-2 justify-center">
      <div
        v-for="index in totalNumberOfSegments"
        :key="index"
        class="border border-solid border-black rounded-lg p-6 flex justify-center"
        :class="{
          'bg-red-500': isBombUncovered(index),
          'bg-slate-200': isSegmentUncovered(index),
          'bg-slate-600': isSegmentCovered(index),
          'bg-yellow-600': isSegmentLocked(index)
        }"
        role="button"
        @click="clickOnSegment(index)"
        @click.right="rightClickOnSegment(index)"
      >
        <p
          v-if="segmentInformationObject[index].numberOfNearbyBombs > 0"
          class="font-black underline text-xs"
        >
          {{ segmentInformationObject[index].numberOfNearbyBombs }}
        </p>
        <p v-else class="invisible">0</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import type { Ref } from 'vue'

import MinesweperMenu from '@/components/Minesweper/MinesweperMenu.vue'

// ------------------ Basic Settings and parameters ----------------------------

const numberOfXSegments = ref(8)
const numberOfYSegments = ref(9)
const numberOfMines = ref(10)

const bombSegmentObjects: Ref<{ index: number; clicked: boolean }[]> = ref([])
const segmentInformationObject: Ref<
  { uncovered: boolean; numberOfNearbyBombs: number; masked: boolean }[]
> = ref([])

const gameEmoji: Ref<string> = ref('😊')
let mineCoversLeft: Ref<number> = ref(10)

const gameIsOn = computed(() => {
  for (let elem in bombSegmentObjects.value) {
    if (bombSegmentObjects.value[elem].clicked) return false
  }
  const numberOfUncoveredSegments = countUncoveredElements()

  const segmentsToUncover = totalNumberOfSegments.value - numberOfMines.value

  if (numberOfUncoveredSegments === segmentsToUncover) {
    gameWin()
    return false
  } else return true
})

const changeGameParamsOnEmit = (rows: string, cols: string, bombs: string) => {
  numberOfXSegments.value = Number(rows)
  numberOfYSegments.value = Number(cols)
  numberOfMines.value = Number(bombs)
  mineCoversLeft.value = Number(bombs)
  GameReset()
}

function gameWin() {
  gameEmoji.value = '🎇'
}

function countUncoveredElements(): number {
  let numberOfUncoveredSegments = 0
  for (let elem in segmentInformationObject.value) {
    if (segmentInformationObject.value[elem].uncovered) numberOfUncoveredSegments++
  }
  return numberOfUncoveredSegments
}

onBeforeMount(() => {
  generateSegmentUncoverFlags()
})

onBeforeMount(() => {
  generateBombSegments()
})

const totalNumberOfSegments = computed(() => {
  let numberOfAllSegments = numberOfXSegments.value * numberOfYSegments.value

  return numberOfAllSegments
})

// ----------------- Click mechanics--------------------

const clickOnSegment = (index: number) => {
  if (isSegmentLocked(index) || !gameIsOn.value) return
  if (!isBomb(index)) {
    segmentInformationObject.value[index].uncovered = true

    segmentInformationObject.value[index].numberOfNearbyBombs = checkIfNearbySegmentIsBomb(index)

    return
  } else gameOver()

  const found = bombSegmentObjects.value.find((e) => e.index === index)
  if (found) found.clicked = true
}

const rightClickOnSegment = (index: number) => {
  if (segmentInformationObject.value[index].uncovered || !gameIsOn.value) {
    return
  }

  if (!segmentInformationObject.value[index].masked && mineCoversLeft.value > 0) {
    segmentInformationObject.value[index].masked = true
    mineCoversLeft.value--
  } else {
    segmentInformationObject.value[index].masked = false
    mineCoversLeft.value++
  }
}

// ----------------------------- Segment Styles Constants --------------------------------

const isBomb = (index: number) => {
  if (bombSegmentObjects.value.find((e) => e.index === index)) return true
}

const isBombUncovered = (index: number) => {
  if (!isBomb(index)) return false

  if (bombSegmentObjects.value.find((e) => e.clicked === true && e.index === index)) return true
}

const isSegmentUncovered = (index: number) => {
  if (isBomb(index)) return false

  if (segmentInformationObject.value[index].uncovered === true) return true
}

const isSegmentCovered = (index: number) => {
  if (!isSegmentUncovered(index) && !isBombUncovered(index)) {
    return true
  } else return false
}

const isSegmentLocked = (index: number) => {
  if (
    !isSegmentUncovered(index) &&
    !isBombUncovered(index) &&
    segmentInformationObject.value[index].masked
  ) {
    return true
  } else return false
}

const gridColsNum = computed(() => {
  return [`grid-rows-${numberOfXSegments.value}`, `grid-cols-${numberOfYSegments.value}`]
})

// ---------------------------------- Functions Generating Segments and Bomb Segments -------------------------------

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

function generateBombSegments() {
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

function generateSegmentUncoverFlags() {
  for (let i = 0; i < totalNumberOfSegments.value + 1; i++) {
    const newElement = { uncovered: false, numberOfNearbyBombs: 0, masked: false }
    segmentInformationObject.value.push(newElement)
  }
}

function checkIfNearbySegmentIsBomb(index: number): number {
  let numberOfNearbyBombs = 0

  numberOfNearbyBombs = detectNearbyBombs(index)

  if (numberOfNearbyBombs) {
    return numberOfNearbyBombs
  } else {
    const indexesToSearch = indexesOfNearbySegments(index)
    for (let ind in indexesToSearch) {
      continueCheckingZeros(indexesToSearch[ind])
    }

    return 0
  }
}

// ---------------------------------- function for uncovering segments and checking numbers of those segmets ----------------------------

function indexesOfNearbySegments(index: number) {
  let nearbyIndexes: number[] = []
  const columnsNr = numberOfYSegments.value
  if (index % columnsNr === 0) {
    nearbyIndexes = [
      index - 1,
      index + columnsNr,
      index + columnsNr - 1,
      index - columnsNr,
      index - columnsNr - 1
    ]
    return nearbyIndexes
  } else if (index % columnsNr === 1) {
    nearbyIndexes = [
      index + 1,
      index + columnsNr,
      index + columnsNr + 1,
      index - columnsNr,
      index - columnsNr + 1
    ]
    return nearbyIndexes
  } else {
    nearbyIndexes = [
      index + 1,
      index - 1,
      index + columnsNr,
      index + columnsNr + 1,
      index + columnsNr - 1,
      index - columnsNr,
      index - columnsNr - 1,
      index - columnsNr + 1
    ]

    return nearbyIndexes
  }
}

function continueCheckingZeros(index: number) {
  if (
    segmentInformationObject.value[index] === undefined ||
    segmentInformationObject.value[index].uncovered === true ||
    segmentInformationObject.value[index].numberOfNearbyBombs > 0
  ) {
    return
  } else {
    clickOnSegment(index)
  }
}

function detectNearbyBombs(index: number) {
  let numberOfNearbyBombs = 0
  const listOfNerbySegments = indexesOfNearbySegments(index)

  for (let elem in listOfNerbySegments) {
    const element = listOfNerbySegments[elem]

    if (isBomb(element)) {
      numberOfNearbyBombs++
    }
  }
  return numberOfNearbyBombs
}

// ---------------- Timer Mechanics ------------------------------------------------------

const timeLeft: Ref<{ minutes: number; seconds: number }> = ref({
  minutes: 10,
  seconds: 0
})

function TimerStart() {
  setInterval(updateTime, 1000)
}

function updateTime() {
  if (timeLeft.value.seconds === 0 && timeLeft.value.minutes === 0) {
    gameOver()
    return
  } else if (!gameIsOn.value) return

  if (timeLeft.value.seconds === 0 && timeLeft.value.minutes > 0) {
    timeLeft.value.minutes--
    timeLeft.value.seconds = 60
  } else {
    timeLeft.value.seconds--
  }
}

TimerStart()

// ----------------------------------------- end Game Resets mechanics ----------------------------------------------------

function gameOver() {
  gameEmoji.value = '😔'
  gameOverUncoveringBombs()
}

function gameOverUncoveringBombs() {
  for (let bomb in bombSegmentObjects.value) {
    bombSegmentObjects.value[bomb].clicked = true
  }
}

const GameReset = () => {
  bombsSwapingOnReset()
  segmentsCoveringForGameReset()
  timeLeft.value = {
    minutes: 10,
    seconds: 0
  }
  gameEmoji.value = '😊'
}

function bombsSwapingOnReset() {
  bombSegmentObjects.value.length = 0

  generateBombSegments()
}

function segmentsCoveringForGameReset() {
  segmentInformationObject.value = []
  mineCoversLeft.value = numberOfMines.value
  generateSegmentUncoverFlags()
}
</script>
