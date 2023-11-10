<template>
  <minesweper-menu
    :coversLeft="mineCoversLeft"
    :Emoji="gameEmoji"
    :time="timeLeft"
    :Reset="GameReset"
    @dimention-change="changeGameParamsOnEmit"
  ></minesweper-menu>

  <minesweper-game
    :number-of-segments="totalNumberOfSegments"
    :segment-info="segmentInformationObject"
    :bomb-info="bombSegmentObjects"
    :col-nr="numberOfYSegments"
    :row-nr="numberOfXSegments"
    :bomb-covers="mineCoversLeft"
    @left-click-on-segment="clickOnSegment"
    @right-click-on-segment="rightClickOnSegment"
  ></minesweper-game>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import type { Ref } from 'vue'

import MinesweperMenu from '@/components/Minesweper/MinesweperMenu.vue'
import MinesweperGame from '@/components/Minesweper/MinesweperGame.vue'

// ------------------ Basic Settings and parameters ----------------------------

const numberOfXSegments = ref(8)
const numberOfYSegments = ref(9)
const numberOfMines = ref(10)

const bombSegmentObjects: Ref<{ index: number; clicked: boolean }[]> = ref([])
const segmentInformationObject: Ref<
  { uncovered: boolean; numberOfNearbyBombs: number; segmentCovered: boolean }[]
> = ref([])

let mineCoversLeft: Ref<number> = ref(10)

const gameIsOn = computed(() => {
  if (someBombIsUncovered.value) return false

  if (countUncoveredElements.value === segmentsToUncover.value) {
    return false
  } else return true
})

const gameEmoji = computed(() => {
  if (someBombIsUncovered.value) {
    return '😔'
  }

  if (gameIsOn.value) {
    return '😊'
  }

  return '🎇'
})

const someBombIsUncovered = computed(() => {
  return bombSegmentObjects.value.some((e) => e.clicked)
})

const segmentsToUncover = computed(() => totalNumberOfSegments.value - numberOfMines.value)

const changeGameParamsOnEmit = (rows: string, cols: string, bombs: string) => {
  numberOfXSegments.value = Number(rows)
  numberOfYSegments.value = Number(cols)
  numberOfMines.value = Number(bombs)
  mineCoversLeft.value = Number(bombs)
  GameReset()
}

const countUncoveredElements = computed(() => {
  return segmentInformationObject.value.filter((e) => e.uncovered).length
})

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
  if (segmentInformationObject.value[index].segmentCovered || !gameIsOn.value) return
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

  if (!segmentInformationObject.value[index].segmentCovered && mineCoversLeft.value > 0) {
    segmentInformationObject.value[index].segmentCovered = true
    mineCoversLeft.value--
  } else {
    segmentInformationObject.value[index].segmentCovered = false
    mineCoversLeft.value++
  }
}

// ----------------------------- Segment Styles Constants --------------------------------

const isBomb = (index: number) => {
  return !!bombSegmentObjects.value?.find((e) => e.index === index)
}

// ---------------------------------- Functions Generating Segments and Bomb Segments -------------------------------

function checkIfOccupyed(index: number, pastIndexes: number[]) {
  return pastIndexes.includes(index)
}

function checkIfNumberIsUnique(index: number, pastIndexes: number[]) {
  return !checkIfOccupyed(index, pastIndexes)
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
    }
  }
  bombSegmentObjects.value = pastIndexes.map((index) => {
    return { index: index, clicked: false }
  })
}

function generateSegmentUncoverFlags() {
  for (let i = 0; i < totalNumberOfSegments.value + 1; i++) {
    const newElement = { uncovered: false, numberOfNearbyBombs: 0, segmentCovered: false }
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
      // checks and uncovers nerbyu segments that don't have any nerby bomb
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
  // checks and uncovers segments that have no nearby bomb
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
}

function bombsSwapingOnReset() {
  bombSegmentObjects.value = []
  generateBombSegments()
}

function segmentsCoveringForGameReset() {
  segmentInformationObject.value = []
  mineCoversLeft.value = numberOfMines.value
  generateSegmentUncoverFlags()
}
</script>
