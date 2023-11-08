<template>
  <div class="flex justify-center">
    <div :class="gridColsNum" class="grid gap-2 justify-center">
      <div
        v-for="index in props.numberOfSegments"
        :key="index"
        class="border border-solid border-black rounded-lg p-6 flex justify-center"
        :class="{
          'bg-red-500': isBombUncovered(index),
          'bg-slate-200': isSegmentUncovered(index),
          'bg-slate-600': isSegmentCovered(index),
          'bg-yellow-600': isSegmentLocked(index)
        }"
        role="button"
        @click="$emit('leftClickOnSegment', index)"
        @click.right="$emit('rightClickOnsegment', index)"
      >
        <p
          v-if="props.segmentInfo[index].numberOfNearbyBombs > 0"
          class="font-black underline text-xs"
        >
          {{ props.segmentInfo[index].numberOfNearbyBombs }}
        </p>
        <p v-else class="invisible">0</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

type bombObject = {
  index: number
  clicked: boolean
}

const props = defineProps({
  numberOfSegments: {
    type: Number,
    required: true
  },
  segmentInfo: {
    required: true,
    type: Object
  },
  bombInfo: {
    required: true,
    type: Object as PropType<bombObject[]>
  },
  colNr: {
    required: true,
    type: Number
  },
  rowNr: {
    required: true,
    type: Number
  },

  bombCovers: {
    required: true,
    type: Number
  }
})

const isBomb = (index: number) => {
  if (props.bombInfo.find((e) => e.index === index)) return true
}

const isBombUncovered = (index: number) => {
  if (!isBomb(index)) return false

  if (props.bombInfo.find((e) => e.clicked === true && e.index === index)) return true
}

const isSegmentUncovered = (index: number) => {
  if (isBomb(index)) return false

  if (props.segmentInfo[index].uncovered === true) return true
}

const isSegmentCovered = (index: number) => {
  if (!isSegmentUncovered(index) && !isBombUncovered(index)) {
    return true
  } else return false
}

const isSegmentLocked = (index: number) => {
  if (!isSegmentUncovered(index) && !isBombUncovered(index) && props.segmentInfo[index].masked) {
    return true
  } else return false
}

const gridColsNum = computed(() => {
  return [`grid-rows-${props.rowNr}`, `grid-cols-${props.colNr}`]
})
</script>
