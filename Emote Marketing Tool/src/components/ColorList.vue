<script setup lang="ts">
import { ref } from "vue";
import { ColorPicker } from "vue3-colorpicker";
import { ColorInputWithoutInstance } from "tinycolor2";
import "vue3-colorpicker/style.css";

const props = defineProps({
  colors: {
    required: true,
    type: Array as () => String[],
    default: false,
  },
  onColorAdded: {
    required: true,
    type: Function,
  },
  onColorRemoved: {
    required: true,
    type: Function,
  },
});

const pureColor = ref<ColorInputWithoutInstance>("red");
</script>

<template>
  <div>
    <color-picker
      v-model:pureColor="pureColor"
      format="hex8"
      use-type="pure"
      pickerType="chrome"
    />
    <button
      class="mt-8 mb-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
      @click="() => props.onColorAdded(pureColor)"
      aria-label="Add color"
    >
      Add Color
    </button>
    <div v-for="color in props.colors">
      <div
        class="inline-block w-4 h-4 rounded mr-2"
        :style="{ background: color as string }"
        role="img"
        :aria-label="`Color swatch: ${color}`"
      ></div>
      <span class="w-20 font-mono uppercase" style="display: inline-block">{{
        color
      }}</span>
      <button
        class="ml-2 text-red-500 cursor-pointer"
        @click="() => props.onColorRemoved(color)"
        aria-label="Remove color"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>
