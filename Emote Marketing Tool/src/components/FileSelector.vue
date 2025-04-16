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
  <div class="h-full w-full grid grid-flow-col">
    <div
      class="relative h-max w-max grid grid-flow-col justify-self-center self-center"
    >
      <div
        class="p-12 bg-neutral-600/50 justify-self-center self-center rounded-4xl inset-shadow-sm inset-shadow-neutral-900"
      >
        <div
          class="text-neutral-100 text-center border-neutral-900/50 border-4 border-dashed rounded-4xl p-20"
        >
          <i class="pi pi-file-arrow-up text-8xl mb-4"></i>
          <h2 class="text text-4xl">Click to choose a file</h2>
          <p class="text text-xl my-4">or</p>
          <h2 class="text text-4xl">Drag a file in here</h2>
        </div>
      </div>
      <div
        class="w-full h-full justify-self-center self-center absolute"
      >
        <input
          class="opacity-0 w-full h-full"
          type="file"
          accept="image/*"
          @change="handleFileUpload"
          ref="fileInput"
        />
      </div>
    </div>
  </div>
</template>
