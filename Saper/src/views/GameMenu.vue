<template>
  <div class="flex justify-center p-4">
    <div
      class="grid gap-4 grid-rows-1 grid-cols-4 bg-slate-400 justify-center rounded-sm p-2 justify-items-center"
    >
      <div class="grid col-span-4">
        <div class="flex justify-center bg-slate-600 rounded-xl">
          <div class="flex">
            <label for="rows" class="block text-xs font-medium text-gray-900 text-center pt-1 pr-1"
              >Nr of Rows</label
            >
            <select
              name="rows"
              id="rows"
              class="bg-slate-500 placeholder:text-gray-950 text-gray-900"
              aria-placeholder="8"
              v-model="selectedNrRows"
            >
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
            </select>

            <label for="cols" class="block text-xs font-medium text-gray-900 text-center pt-1 pr-1"
              >Nr of Cols</label
            >
            <select
              name="cols"
              id="cols"
              class="bg-slate-500 placeholder:text-gray-950 text-gray-900"
              aria-placeholder="8"
              v-model="selectedNrCols"
            >
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
            </select>

            <label for="bombs" class="block text-xs font-medium text-gray-900 text-center pt-1 pr-1"
              >Nr of bombs</label
            >
            <select
              name="cols"
              id="cols"
              class="bg-slate-500 placeholder:text-gray-950 text-gray-900"
              v-model="selectedNrBombs"
            >
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
              <option>12</option>
              <option>13</option>
              <option>14</option>
              <option>15</option>
            </select>
            <input
              type="submit"
              value="Submit"
              class="bg-yellow-400 rounded-r-xl"
              @click="ChangeGameParams"
              role="button"
            />
          </div>
        </div>
      </div>
      <div class="col-span-4 grid grid-cols-3">
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
  </div>

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

const numberOfXSegments = ref(8)
const numberOfYSegments = ref(9)
const numberOfMines = ref(10)

const selectedNrRows: Ref<string> = ref('')
const selectedNrCols: Ref<string> = ref('')
const selectedNrBombs: Ref<string> = ref('')

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
  if (numberOfUncoveredSegments + -1 === segmentsToUncover) {
    gameWin()
    return false
  } else return true
})

const ChangeGameParams = () => {
  if (!selectedNrCols.value || !selectedNrRows.value || !selectedNrBombs.value) {
    return
  }

  numberOfXSegments.value = Number(selectedNrRows.value)
  numberOfYSegments.value = Number(selectedNrCols.value)
  numberOfMines.value = Number(selectedNrBombs.value)
  mineCoversLeft.value = Number(selectedNrBombs.value)
  GameReset()
  console.log('hangess')
  return 'hi'
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

const gridColsNum = computed(() => {
  return [`grid-rows-${numberOfXSegments.value}`, `grid-cols-${numberOfYSegments.value}`]
})

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
  for (let elem in segmentInformationObject.value) {
    segmentInformationObject.value[elem].masked = false
    segmentInformationObject.value[elem].uncovered = false
    segmentInformationObject.value[elem].numberOfNearbyBombs = 0
  }
}
</script>
