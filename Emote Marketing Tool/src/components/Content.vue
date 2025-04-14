<script setup lang="ts">
    import { ref } from "vue";
    import ImagePreviewList from "./ImagePreviewList.vue";
    import FileSelector from "./FileSelector.vue";

    const props = defineProps({
        sizes: {
            required: true,
            type: Array as () => number[],
        },
    });

    const promoCanvasRef = ref<HTMLCanvasElement | null>(null);
    const originalImage = ref<HTMLImageElement | null>(null);

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
        backgroundColors.value.forEach((bg, rowIndex) => {
            const rowOffset = rowIndex * rowHeight + rowHeight / 2 - slotSize / 2;

            sizes.forEach((size, colIndex) => {
                const preview = previews.value.find((p) => p.bg === bg && p.size === size);
                if (!preview) return;

                const img = new Image();
                img.src = preview.dataUrl;

                const promise = new Promise<void>((resolve) => {
                    img.onload = () => {
                        const colOffset = colIndex * slotSize;
                        const xOffset = colOffset + horizontalPadding + (slotSize / 2 - size / 2);
                        const yOffset = rowOffset + (slotSize / 2 - size / 2);

                        context.fillStyle = "red";
                        context.lineWidth = 2;
                        context.strokeStyle = "#FF0000";
                        context.strokeRect(colOffset + horizontalPadding, rowOffset, slotSize, slotSize);
                        context.drawImage(img, xOffset, yOffset, size, size);
                        resolve();
                    };
                });
                loadPromises.push(promise);
            });
        });

        return await Promise.all(loadPromises);
    };

    const clearEmote = () => {
        originalImage.value = null;
        promoCanvasRef.value = null;
    };
</script>

<template>
    <div class="emote-uploader">
        <div
            class="transition-all"
            :class="originalImage == null ? 'block' : 'hidden'"
        >
            <FileSelector :onImageSelected="(image: HTMLImageElement) => {originalImage = image}" />
        </div>
        <div
            class="transition-all"
            :class="originalImage == null ? 'hidden' : 'block'"
        >
            <button
                type="button"
                class="mt-8 mb-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer align-middle"
                @click="clearEmote"
                aria-label="Clear selected emote"
            >
                Clear emote
                <i
                    class="pi pi-times align-text-bottom ml-2"
                    aria-hidden="true"
                ></i>
            </button>
            <ImagePreviewList
                :sizes="props.sizes"
                :originalImage="originalImage"
            />
        </div>

        <div class="preview-row">
            <canvas
                :ref="(el: HTMLCanvasElement) => (promoCanvasRef = el)"
                :width="500"
                :height="400"
            ></canvas>
        </div>
        <!--         
        <button
            @click="downloadPreview"
            :disabled="!previews.length"
        >
            Download Preview
        </button> -->
    </div>
</template>
