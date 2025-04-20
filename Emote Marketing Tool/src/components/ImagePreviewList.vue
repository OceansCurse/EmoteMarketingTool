<script setup lang="ts">
    import { ref, watch } from "vue";
    import type { Settings } from "../types/Settings.ts";

    const props = defineProps({
        settings: {
            required: true,
            type: Object as () => Settings,
        },
        originalImage: {
            type: HTMLImageElement || null,
            default: null,
        },
        onClearEmote: {
            type: Function,
            default: () => {},
        },
    });
    interface Preview {
        size: number;
        dataUrl: string;
    }
    const previews = ref<Preview[]>([]);
    const sizeCanvasRefs = ref<Map<string, HTMLCanvasElement>>(new Map());
    const previewCanvasRefs = ref<Map<string, HTMLCanvasElement>>(new Map());
    const originalCanvasRef = ref<HTMLCanvasElement | null>(null);

    const setCanvasRef = (size: number, el: Element | null) => {
        if (el instanceof HTMLCanvasElement) {
            sizeCanvasRefs.value.set(`scaled-${size}`, el);
        } else {
            console.error("Element is not a canvas:", el);
        }
    };

    const setPreviewCanvasRef = (backgroundColor: string, el: Element | null) => {
        if (el instanceof HTMLCanvasElement) {
            sizeCanvasRefs.value.set(`preview-${backgroundColor}`, el);
            drawBackgroundPreview(backgroundColor, el);
        } else {
            console.error("Element is not a canvas:", el);
        }
    };

    // Needs to be optimized, Could just generate sizes ones when the image is uploaded
    // Taking the original size and just halving it until something like 12px, then every time
    // sizes change, it could just pick the closest bigger size.
    const generateSizePreviews = (original: HTMLCanvasElement | null) => {
        const sizes = props.settings.sizes;
        if (original instanceof HTMLCanvasElement) {
            originalCanvasRef.value = original;
        } else {
            console.error("Element is not a canvas:", original);
            return;
        }

        previews.value = [];
        if (!props.originalImage) return;
        if (sizeCanvasRefs.value.size === 0) return;

        const originalCanvas = originalCanvasRef.value;
        if (!originalCanvas) return;

        const originalContext = originalCanvasRef.value.getContext("2d");
        if (!originalContext || !props.originalImage) return;

        let resizeSize = originalCanvasRef.value.width;
        // console.log("original size is", resizeSize);
        originalContext.drawImage(props.originalImage, 0, 0, resizeSize, resizeSize, 0, 0, resizeSize, resizeSize);

        const resizeCanvas = document.createElement("canvas");
        resizeCanvas.width = resizeSize;
        resizeCanvas.height = resizeSize;

        const resizeContext = resizeCanvas.getContext("2d")!!;
        resizeContext.imageSmoothingEnabled = true;
        resizeContext.drawImage(originalCanvas, 0, 0, resizeSize, resizeSize);

        sizes.forEach((size) => {
            // console.log("Generating preview for size: ", size, resizeSize);
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
                // console.log("size is now: ", resizeSize);
                resizeContext.drawImage(tempCanvas, 0, 0, resizeSize, resizeSize);
            }

            const canvas = sizeCanvasRefs.value.get(`scaled-${size}`);
            if (!canvas) return;
            canvas.width = size;
            canvas.height = size;

            const context = canvas.getContext("2d");
            if (!context) return;

            // Enable image smoothing (cross-browser)
            context.imageSmoothingEnabled = true;

            // Clear
            // console.log("Drawing resize canvas at ", size);
            context.drawImage(resizeCanvas, 0, 0, size, size);

            previews.value.push({
                size,
                dataUrl: canvas.toDataURL("image/png"),
            });
        });
    };

    const drawBackgroundPreview = async (bg: string, canvas: HTMLCanvasElement) => {
        const context = canvas.getContext("2d");
        if (!context) return;

        const sizes = props.settings.sizes;
        const spacing = Number(props.settings.iconSpacing);
        const horizontalPadding = Number(props.settings.horizontalOuterPadding);
        const verticalPadding = Number(props.settings.verticalOuterPadding);

        const slotHeight = sizes[0];
        const slotsWidth = props.settings.useLargestWidth ? sizes[0] * sizes.length : sizes.reduce((acc, size) => acc + size);
        const rowHeight = slotHeight + verticalPadding * 2;
        const totalWidth = slotsWidth + horizontalPadding * 2 + (sizes.length - 1) * spacing;

        canvas.width = totalWidth;
        canvas.height = rowHeight;

        context.fillStyle = bg;
        context.fillRect(0, 0, totalWidth, rowHeight);

        let colOffset = 0;
        sizes.forEach((size, colIndex) => {
            const preview = previews.value.find((p) => p.size === size);
            if (!preview) return;

            const width = props.settings.useLargestWidth ? sizes[0] : size;
            const xOffset = colOffset + horizontalPadding + spacing * colIndex;
            const yOffset = rowHeight / 2 - slotHeight / 2;
            const xAlignOffset = width / 2 - size / 2;
            let yAlignOffset = slotHeight / 2 - size / 2;
            switch (props.settings.verticalAlignment) {
                case "top":
                    yAlignOffset = 0;
                    break;
                case "middle":
                    yAlignOffset = slotHeight / 2 - size / 2;
                    break;
                case "bottom":
                    yAlignOffset = slotHeight - size;
                    break;
                default:
                    yAlignOffset = slotHeight / 2 - size / 2;
                    break;
            }

            context.fillStyle = "red";
            context.lineWidth = 2;
            context.strokeStyle = "#FF0000";
            context.strokeRect(xOffset, yOffset, width, slotHeight);

            const canvas = sizeCanvasRefs.value.get(`scaled-${size}`);
            if (!canvas) return;
            context.drawImage(canvas, xOffset + xAlignOffset, yOffset + yAlignOffset, size, size);

            // draw the size label if enabled
            if (props.settings.showSizeLabels) {
                context.fillStyle = props.settings.sizeLabelColor;
                context.font = `500 ${props.settings.sizeLabelFontSize}px "${props.settings.sizeLabelFontFamily}", sans-serif`;
                context.textAlign = "center";
                context.textBaseline = "bottom";
                context.fillText(`${size}x${size}`, xOffset + xAlignOffset + size / 2, yOffset + slotHeight + props.settings.sizeLabelFontSize + 8);
            }

            colOffset += width;
        });
    };

    const downloadPreview = async () => {
        const canvas = document.createElement("canvas");
        await drawBackgroundPreview("black", canvas);

        const link = document.createElement("a");
        link.download = "emote-preview.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    watch(
        () => props.settings,
        (newSettings) => {
            sizeCanvasRefs.value.forEach((canvas, size) => {
                generateSizePreviews(canvas);
            });
            previewCanvasRefs.value.forEach((canvas, bg) => {
                drawBackgroundPreview(bg, canvas);
            });
        },
        { immediate: true, deep: true }
    );
</script>

<template>
    <div class="w-full flex flex-flow-col flex-wrap">
        <!-- Sizes -->
        <div class="flex-1 w-full m-8">
            <div class="flex flex-flow-row justify-between items-center">
                <h2 class="text text-4xl">Sizes</h2>
                <button
                    type="button"
                    class="bg-blue-500 text-white w-max px-4 py-2 rounded cursor-pointer align-end"
                    @click="props.onClearEmote()"
                    aria-label="Clear selected emote">
                    Clear emote
                    <i
                        class="pi pi-times align-text-bottom ml-2"
                        aria-hidden="true"></i>
                </button>
            </div>
            <p
                v-if="!props.originalImage"
                class="text text-l">
                No image uploaded
            </p>
            <div
                v-for="size in props.settings.sizes"
                :key="size"
                class="inline-block m-2">
                <canvas
                    :ref="(el) => setCanvasRef(size, el as HTMLCanvasElement)"
                    :width="size"
                    :height="size"></canvas>
                <p class="text text-center w-full">{{ size }}x{{ size }}</p>
            </div>
            <div class="m-2">
                <div class="w-max">
                    <canvas
                        :ref="(el) => generateSizePreviews(el as HTMLCanvasElement)"
                        :width="originalImage?.naturalWidth ?? 0"
                        :height="originalImage?.naturalWidth ?? 0"></canvas>
                    <p
                        v-if="originalImage"
                        class="text text-center w-full">
                        {{ originalImage?.naturalWidth ?? 0 }}x{{ originalImage?.naturalWidth ?? 0 }}
                        (Original)
                    </p>
                </div>
            </div>
        </div>
        <!-- Previews -->
        <div class="flex-1 w-full m-8">
            <h2 class="text text-4xl">Previews</h2>
            <div class="preview-row mt-4">
                <canvas
                    v-for="backgroundColor in props.settings.backgroundColors"
                    :ref="(el) => { setPreviewCanvasRef(backgroundColor, el as HTMLCanvasElement) }"></canvas>
            </div>
        </div>
    </div>
</template>
