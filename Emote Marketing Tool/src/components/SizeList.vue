<script setup lang="ts">
import { ref } from "vue";
import "vue3-colorpicker/style.css";
const props = defineProps({
  sizes: {
    required: true,
    type: Array as () => number[],
  },
  onSizeAdded: {
    required: true,
    type: Function,
  },
  onSizeRemoved: {
    required: true,
    type: Function,
  },
});
const pureColor = ref<number>(128);
</script>

<template>
  <div>
    <input
      type="number"
      class="border-2 w-40 mr-2 border-gray-300 rounded px-2 py-1 mb-4"
      v-model="pureColor"
      data-form-type="other"
      placeholder="Enter size"
    />

    <button
      class="mt-8 mb-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
      @click="() => props.onSizeAdded(pureColor)"
      aria-label="Add size"
    >
      Add Size
    </button>
    <div v-for="size in props.sizes">
      <div class="mr-2 inline-block" style="width: 100px">
        <span class="font-mono" style="display: inline-block">
          {{ size }}
        </span>
        <span class="font-mono" style="display: inline-block"> x </span>
        <span class="font-mono" style="display: inline-block">
          {{ size }}
        </span>
      </div>
      <button
        class="inline-block text-red-500 cursor-pointer"
        @click="() => props.onSizeRemoved(size)"
        aria-label="Remove size"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>
