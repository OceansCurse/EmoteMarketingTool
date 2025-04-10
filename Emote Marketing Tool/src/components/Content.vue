<script setup lang="ts">
import { ref } from "vue";

interface Preview {
  bg: string;
  size: number;
  dataUrl: string;
}

const fileInput = ref<HTMLInputElement | null>(null);
const originalSize = ref<number>(0);
const sizes = [112, 56, 28] as const;
const previews = ref<Preview[]>([]);
const originalImage = ref<HTMLImageElement | null>(null);
const canvasRefs = ref<Map<string, HTMLCanvasElement>>(new Map());
const promoCanvasRef = ref<HTMLCanvasElement | null>(null);
const originalImageCanvas = ref<HTMLCanvasElement | null>(null);
const backgroundColors = ref<String[]>(["#FFFFFF", "#000000"]);

const setCanvasRef = (bg: string, size: number, el: Element | null) => {
  if (el instanceof HTMLCanvasElement) {
    console.log("Setting canvas ref:", bg, size, el);
    canvasRefs.value.set(`${bg}-${size}`, el);
  } else {
    console.error("Element is not a canvas:", el);
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const img = new Image();
  const reader = new FileReader();

  reader.onload = (e) => {
    img.src = e.target?.result as string;
    img.onload = () => {
      originalImage.value = img;
      setOriginalImage();
      generatePreviews();
      drawPreviewImage(promoCanvasRef.value as HTMLCanvasElement);
    };
  };
  reader.readAsDataURL(file);
};

const setOriginalImage = () => {
  if (originalImageCanvas.value == null) {
    console.error("originalImageCanvas ref is null");
    return;
  }
  const context = originalImageCanvas.value.getContext("2d");

  if (originalImage.value == null) {
    console.error("Original Image has no value");
    return;
  }

  context?.drawImage(originalImage.value, 0, 0);
};

const generatePreviews = () => {
  previews.value = [];
  ["black", "white"].forEach((bg) => {
    sizes.forEach((size) => {
      const canvas = canvasRefs.value.get(`${bg}-${size}`);
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context || !originalImage.value) return;

      // Enable image smoothing (cross-browser)
      context.imageSmoothingEnabled = true;

      // Clear and set background
      context.clearRect(0, 0, size, size);
      context.fillStyle = bg;
      context.fillRect(0, 0, size, size);

      // Multi-step scaling for better quality
      // Step 1: Scale to 224x224 (intermediate for all sizes)
      const step1Canvas = document.createElement("canvas");
      step1Canvas.width = 224;
      step1Canvas.height = 224;
      const step1Context = step1Canvas.getContext("2d");
      if (!step1Context) return;
      step1Context.imageSmoothingEnabled = true;
      step1Context.drawImage(originalImage.value, 0, 0, 224, 224);

      if (size === 112) {
        // Step 2: Scale from 224x224 to 112x112
        context.drawImage(step1Canvas, 0, 0, 112, 112);
      } else if (size === 56) {
        // Step 2: Scale from 224x224 to 112x112
        const step2Canvas = document.createElement("canvas");
        step2Canvas.width = 112;
        step2Canvas.height = 112;
        const step2Context = step2Canvas.getContext("2d");
        if (!step2Context) return;
        step2Context.imageSmoothingEnabled = true;
        step2Context.drawImage(step1Canvas, 0, 0, 112, 112);

        // Step 3: Scale from 112x112 to 56x56
        context.drawImage(step2Canvas, 0, 0, 56, 56);
      } else if (size === 28) {
        // Step 2: Scale from 224x224 to 112x112
        const step2Canvas = document.createElement("canvas");
        step2Canvas.width = 112;
        step2Canvas.height = 112;
        const step2Context = step2Canvas.getContext("2d");
        if (!step2Context) return;
        step2Context.imageSmoothingEnabled = true;
        step2Context.drawImage(step1Canvas, 0, 0, 112, 112);

        // Step 3: Scale from 112x112 to 56x56
        const step3Canvas = document.createElement("canvas");
        step3Canvas.width = 56;
        step3Canvas.height = 56;
        const step3Context = step3Canvas.getContext("2d");
        if (!step3Context) return;
        step3Context.imageSmoothingEnabled = true;
        step3Context.drawImage(step2Canvas, 0, 0, 56, 56);

        // Step 4: Scale from 56x56 to 28x28
        context.drawImage(step3Canvas, 0, 0, 28, 28);
      }

      previews.value.push({
        bg,
        size,
        dataUrl: canvas.toDataURL("image/png"),
      });
    });
  });
};

const downloadPreview = async () => {
  const canvas = document.createElement("canvas");
  await drawPreviewImage(canvas);

  const link = document.createElement("a");
  link.download = "emote-preview.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

const drawPreviewImage = async (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d");
  if (!context) return;

  const slotSize = 112;
  const totalWidth = 500;
  const rowHeight = 200;
  const emotesWidth = 112 * 3;
  const horizontalPadding = (totalWidth - emotesWidth) / 2;

  canvas.width = totalWidth;
  canvas.height = rowHeight * 2;

  // Draw full background rectangles
  context.fillStyle = "black";
  context.fillRect(0, 0, totalWidth, rowHeight);
  context.fillStyle = "white";
  context.fillRect(0, rowHeight, totalWidth, rowHeight);

  // Load and draw images
  const loadPromises: Promise<void>[] = [];
  ["black", "white"].forEach((bg, rowIndex) => {
    const rowOffset = rowIndex * rowHeight + rowHeight / 2 - slotSize / 2;

    sizes.forEach((size, colIndex) => {
      const preview = previews.value.find(
        (p) => p.bg === bg && p.size === size
      );
      if (!preview) return;

      const img = new Image();
      img.src = preview.dataUrl;

      const promise = new Promise<void>((resolve) => {
        img.onload = () => {
          const colOffset = colIndex * slotSize;
          const xOffset =
            colOffset + horizontalPadding + (slotSize / 2 - size / 2);
          const yOffset = rowOffset + (slotSize / 2 - size / 2);

          context.fillStyle = "red";
          context.lineWidth = 2;
          context.strokeStyle = "#FF0000";
          context.strokeRect(
            colOffset + horizontalPadding,
            rowOffset,
            slotSize,
            slotSize
          );
          context.drawImage(img, xOffset, yOffset, size, size);
          resolve();
        };
      });
      loadPromises.push(promise);
    });
  });

  return await Promise.all(loadPromises);
};
</script>

<template>
  <div class="emote-uploader">
    <input
      type="file"
      accept="image/*"
      @change="handleFileUpload"
      ref="fileInput"
    />

    <canvas
      :ref="(el: HTMLCanvasElement) => (originalImageCanvas = el)"
      :width="originalSize"
      :height="originalSize"
    ></canvas>
    <p>Original</p>

    <div>
      <h2>Backgrounds</h2>
      <div v-for="backgroundColor in backgroundColors">
        <div
          style="display: inline-block; height: 20px; width: 20px"
          :style="{ background: backgroundColor }"
        ></div>
        <p style="display: inline">{{ backgroundColor }}</p>
      </div>
    </div>

    <div class="preview-container">
      <div class="preview-row" v-for="bg in ['black', 'white']" :key="bg">
        <div v-for="size in sizes" :key="size" class="emote-preview">
          <canvas
            :ref="(el) => setCanvasRef(bg, size, el as HTMLCanvasElement)"
            :width="size"
            :height="size"
            :style="{ backgroundColor: bg }"
          ></canvas>
          <p>{{ size }}x{{ size }}</p>
        </div>
      </div>
      <div class="preview-row">
        <canvas
          :ref="(el: HTMLCanvasElement) => (promoCanvasRef = el)"
          :width="500"
          :height="400"
        ></canvas>
      </div>
      <button @click="downloadPreview" :disabled="!previews.length">
        Download Preview
      </button>
    </div>
  </div>
</template>

<style scoped>
.emote-uploader {
  padding: 20px;
}

.preview-container {
  margin-top: 20px;
}

.preview-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.emote-preview {
  text-align: center;
}

canvas {
  border: 1px solid #ccc;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
