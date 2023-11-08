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
              v-model="rows"
            >
              <option v-for="num in colsAndRowsOptionsList" :key="num">{{ num }}</option>
            </select>

            <label for="cols" class="block text-xs font-medium text-gray-900 text-center pt-1 pr-1"
              >Nr of Cols</label
            >
            <select
              name="cols"
              id="cols"
              class="bg-slate-500 placeholder:text-gray-950 text-gray-900"
              aria-placeholder="8"
              v-model="cols"
            >
              <option v-for="num in colsAndRowsOptionsList" :key="num">{{ num }}</option>
            </select>

            <label for="bombs" class="block text-xs font-medium text-gray-900 text-center pt-1 pr-1"
              >Nr of bombs</label
            >
            <select
              name="cols"
              id="cols"
              class="bg-slate-500 placeholder:text-gray-950 text-gray-900"
              v-model="bombs"
            >
              <option v-for="num in bombsOptionList" :key="num">{{ num }}</option>
            </select>
            <input
              type="submit"
              value="Submit"
              class="bg-yellow-400 rounded-r-xl px-1"
              @click="$emit('dimentionChange', rows, cols, bombs)"
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
            `${props.time.minutes.toString().padStart(2, '0')}:${props.time.seconds
              .toString()
              .padStart(2, '0')}`
          }}
        </div>
        <div
          class="border border-solid border-black border-spacing-2 p-2 flex justify-center"
          role="button"
          @click="props.Reset"
        >
          {{ props.Emoji }}
        </div>
        <div
          class="p-2 border-spacing-2 border border-solid border-black bg-slate-800 text-red-700 flex justify-center lining-nums text-xl"
        >
          {{ props.coversLeft.toString().padStart(3, '0') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const colsAndRowsOptionsList = Array.from(new Array(8), (x, i) => i + 4)

const bombsOptionList = Array.from(new Array(12), (x, i) => i + 4)

const props = defineProps({
  Emoji: {
    type: String
  },

  time: {
    type: Object,
    required: true
  },
  Reset: {
    type: Object
  },
  coversLeft: {
    type: Number,
    default: 10
  }
})

const rows = ref('')
const cols = ref('')
const bombs = ref('')
</script>
