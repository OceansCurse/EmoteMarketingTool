<script setup lang="ts">
    import { ref, watch } from "vue";

    const props = defineProps({
        sizes: {
            required: true,
            type: Array as () => number[],
        },
        backgroundColors: {
            required: true,
            type: Array as () => string[],
        },
        originalImage: {
            type: HTMLImageElement || null,
            default: null,
        },
    });
    interface Preview {
        size: number;
        dataUrl: string;
    }
    const previews = ref<Preview[]>([]);
    const canvasRefs = ref<Map<string, HTMLCanvasElement>>(new Map());
    const originalCanvasRef = ref<HTMLCanvasElement | null>(null);

    const setCanvasRef = (size: number, el: Element | null) => {
        if (el instanceof HTMLCanvasElement) {
            canvasRefs.value.set(`scaled-${size}`, el);
        } else {
            console.error("Element is not a canvas:", el);
        }
    };

    // Needs to be optimized, Could just generate sizes ones when the image is uploaded
    // Taking the original size and just halving it until something like 12px, then every time
    // sizes change, it could just pick the closest bigger size.
    const generatePreviews = (original: HTMLCanvasElement | null) => {
        if (original instanceof HTMLCanvasElement) {
            originalCanvasRef.value = original;
        } else {
            console.error("Element is not a canvas:", original);
            return;
        }

        previews.value = [];
        if (!props.originalImage) return;
        if (canvasRefs.value.size === 0) return;

        const originalCanvas = originalCanvasRef.value;
        if (!originalCanvas) return;

        const originalContext = originalCanvasRef.value.getContext("2d");
        if (!originalContext || !props.originalImage) return;

        let resizeSize = originalCanvasRef.value.width;
        console.log("original size is", resizeSize);
        originalContext.drawImage(props.originalImage, 0, 0, resizeSize, resizeSize, 0, 0, resizeSize, resizeSize);

        const resizeCanvas = document.createElement("canvas");
        resizeCanvas.width = resizeSize;
        resizeCanvas.height = resizeSize;

        const resizeContext = resizeCanvas.getContext("2d")!!;
        resizeContext.imageSmoothingEnabled = true;
        resizeContext.drawImage(originalCanvas, 0, 0, resizeSize, resizeSize);

        props.sizes.forEach((size) => {
            console.log("Generating preview for size: ", size, resizeSize);
            if (size * 2 < resizeSize) {
                let tempCanvas = document.createElement("canvas");
                tempCanvas.width = resizeSize;
                tempCanvas.height = resizeSize;
                const tempContext = tempCanvas.getContext("2d")!!;
                tempContext.imageSmoothingEnabled = true;
                tempContext.drawImage(resizeCanvas, 0, 0, resizeSize, resizeSize);

                resizeContext.clearRect(0, 0, resizeSize, resizeSize);
                resizeSize /= 2;
                resizeCanvas.width = resizeSize;
                resizeCanvas.height = resizeSize;
                console.log("size is now: ", resizeSize);
                resizeContext.drawImage(tempCanvas, 0, 0, resizeSize, resizeSize);
            }

            const canvas = canvasRefs.value.get(`scaled-${size}`);
            if (!canvas) return;
            canvas.width = size;
            canvas.height = size;

            const context = canvas.getContext("2d");
            if (!context) return;

            // Enable image smoothing (cross-browser)
            context.imageSmoothingEnabled = true;

            // Clear
            console.log("Drawing resize canvas at ", size);
            context.drawImage(resizeCanvas, 0, 0, size, size);

            previews.value.push({
                size,
                dataUrl: canvas.toDataURL("image/png"),
            });
        });
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
        props.backgroundColors.forEach((bg, rowIndex) => {
            const rowOffset = rowIndex * rowHeight + rowHeight / 2 - slotSize / 2;

            props.sizes.forEach((size, colIndex) => {
                const preview = previews.value.find((p) => p.size === size);
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

    const downloadPreview = async () => {
        const canvas = document.createElement("canvas");
        await drawPreviewImage(canvas);

        const link = document.createElement("a");
        link.download = "emote-preview.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    watch(
        () => props.sizes,
        (newSizes) => generatePreviews(null),
        { immediate: true, deep: true }
    );
</script>

<template>
    <div class="w-full flex flex-flow-col">
        <!-- Sizes -->
        <div class="w-full m-8">
            <h2 class="text text-4xl">Sizes</h2>
            <p
                v-if="!props.originalImage"
                class="text text-l">
                No image uploaded
            </p>
            <div class="inline-block m-2">
                <canvas
                    :ref="(el) => generatePreviews(el as HTMLCanvasElement)"
                    :width="originalImage?.naturalWidth ?? 0"
                    :height="originalImage?.naturalWidth ?? 0"></canvas>
                <p
                    v-if="originalImage"
                    class="text text-center w-full">
                    {{ originalImage?.naturalWidth ?? 0 }}x{{ originalImage?.naturalWidth ?? 0 }}
                    (Original)
                </p>
            </div>
            <div
                v-for="size in props.sizes"
                :key="size"
                class="inline-block m-2">
                <canvas
                    :ref="(el) => setCanvasRef(size, el as HTMLCanvasElement)"
                    :width="size"
                    :height="size"></canvas>
                <p class="text text-center w-full">{{ size }}x{{ size }}</p>
            </div>
        </div>
        <!-- Previews -->
        <div class="w-full m-8">
            <h2 class="text text-4xl">Previews</h2>
            <div class="preview-row">
                <canvas
                    :ref="(el: HTMLCanvasElement) => (promoCanvasRef = el)"
                    :width="500"
                    :height="400"></canvas>
            </div>
        </div>
    </div>

    <!--         
        <button
            @click="downloadPreview"
            :disabled="!previews.length"
        >
            Download Preview
        </button> -->
</template>
