<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  onImageSelected: {
    required: true,
    type: Function,
  },
});

const fileInput = ref<HTMLInputElement | null>(null);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const image = new Image();
  const reader = new FileReader();

  reader.onload = (e) => {
    image.src = e.target?.result as string;
    image.onload = () => {
      props.onImageSelected(image);
    };
  };
  reader.readAsDataURL(file);
};
</script>

<template>
  <div class="w-full h-200 bg-neutral-600 rounded-2xl relative">
    <div class="absolute w-full h-full">
      <div class="h-full grid grid-flow-col justify-items-center">
        <div class="p-12 bg-neutral-700 self-center rounded-4xl inset-shadow-sm inset-shadow-neutral-900/50">
          <div
            class="text-neutral-100 justify-items-center border-neutral-900/50 border-4 border-spacing-20 border-dashed rounded-4xl p-20"
          >
            <h2 class="text text-4xl">Click to choose a file</h2>
            <p class="text text-xl">or</p>
            <h2 class="text text-4xl">Drag a file in here</h2>
          </div>
        </div>
      </div>
    </div>
    <input
      class="w-full h-full opacity-0 absolute"
      type="file"
      accept="image/*"
      @change="handleFileUpload"
      ref="fileInput"
    />
  </div>
</template>
