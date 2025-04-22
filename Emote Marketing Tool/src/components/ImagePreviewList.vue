<script setup lang="ts">
    import { ref, watch } from "vue";
    import type { Settings } from "../types/Settings.ts";
    import JSZip from "jszip";
    import { saveAs } from "file-saver";

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
    const labelColors = ref<string[]>(props.settings.sizeLabelColors);

    const setCanvasRef = (size: number, el: Element | null) => {
        if (el instanceof HTMLCanvasElement) {
            sizeCanvasRefs.value.set(`scaled-${size}`, el);
        } else {
            console.error("Element is not a canvas:", el);
        }
    };

    const setPreviewCanvasRef = (backgroundColor: string, el: Element | null) => {
        if (el instanceof HTMLCanvasElement) {
            previewCanvasRefs.value.set(`preview-${backgroundColor}`, el);
            const index = props.settings.backgroundColors.indexOf(backgroundColor);
            drawBackgroundPreview(backgroundColor, labelColors.value[index], el);
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

    const drawBackgroundPreview = async (backgroundColor: string, labelColor: string, canvas: HTMLCanvasElement) => {
        const context = canvas.getContext("2d");
        if (!context) return;

        const settings = props.settings;
        const sizes = settings.sizes;
        const spacing = Number(settings.iconSpacing);
        const horizontalPadding = Number(settings.horizontalOuterPadding);
        const verticalPadding = Number(settings.verticalOuterPadding);
        const textHeight = settings.sizeLabelsOccupySpace && settings.showSizeLabels ? Number(props.settings.sizeLabelFontSize) : 0;

        const slotHeight = sizes[0];
        const slotsWidth = props.settings.useLargestWidth ? sizes[0] * sizes.length : sizes.reduce((acc, size) => acc + size);
        const rowHeight = slotHeight + textHeight + verticalPadding * 2;
        const totalWidth = slotsWidth + horizontalPadding * 2 + (sizes.length - 1) * spacing;

        canvas.width = totalWidth;
        canvas.height = rowHeight;

        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, totalWidth, rowHeight);

        let colOffset = 0;
        sizes.forEach((size, colIndex) => {
            const preview = previews.value.find((p) => p.size === size);
            if (!preview) return;

            const width = props.settings.useLargestWidth ? sizes[0] : size;
            const xOffset = colOffset + horizontalPadding + spacing * colIndex;
            const yOffset = verticalPadding;
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
            // context.strokeRect(xOffset, yOffset, width, slotHeight);

            const canvas = sizeCanvasRefs.value.get(`scaled-${size}`);
            if (!canvas) return;
            context.drawImage(canvas, xOffset + xAlignOffset, yOffset + yAlignOffset, size, size);

            // draw the size label if enabled
            if (props.settings.showSizeLabels) {
                context.fillStyle = labelColor;
                context.font = `500 ${props.settings.sizeLabelFontSize}px "${props.settings.sizeLabelFontFamily}", sans-serif`;
                context.textAlign = "center";
                context.textBaseline = "bottom";
                context.fillText(`${size}x${size}`, xOffset + xAlignOffset + size / 2, yOffset + slotHeight + props.settings.sizeLabelFontSize + 8);
            }

            colOffset += width;
        });
    };

    const downloadCanvas = async (backgroundColor: string) => {
        const canvas = previewCanvasRefs.value.get(`preview-${backgroundColor}`);
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `emote-banner-${backgroundColor}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const downloadEmotes = async () => {
        const zip = new JSZip();

        // Convert each canvas to a PNG and add to ZIP
        for (const canvasRef of sizeCanvasRefs.value) {
            const size = canvasRef[0].split("-")[1];
            const canvas = canvasRef[1];
            if (!canvas) continue;

            const dataUrl = canvas.toDataURL("image/png");
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            zip.file(`icon-${size}x${size}.png`, base64Data, { base64: true });
        }

        // Generate ZIP and trigger download
        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "icons.zip");
        } catch (error) {
            console.error("Error generating ZIP:", error);
        }
    };

    const downloadFullPreview = async () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!canvas) return;
        if (!context) return;

        let height = 0;
        let width = 0;
        previewCanvasRefs.value.forEach((canvas) => {
            height += canvas.height;
            width = Math.max(width, canvas.width);
        });
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, canvas.width, canvas.height);

        let heightOffset = 0;
        previewCanvasRefs.value.forEach((canvas, backgroundColor) => {
            context.drawImage(canvas, 0, heightOffset);
            heightOffset += canvas.height;
        });

        const link = document.createElement("a");
        link.download = "full-emote-preview.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const getDownlodIconColor = (color = "") => {
        // Parse hex (remove #, ignore alpha)
        const colorPart = color.slice(1).substring(0, 6);
        const rgb = parseInt(colorPart, 16);

        // Extract RGB components
        const r = (rgb >> 16) & 255;
        const g = (rgb >> 8) & 255;
        const b = rgb & 255;

        // Calculate luminance (perceived brightness)
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        // Return white for dark colors, black for light colors
        return luminance > 128 ? "#000000" : "#FFFFFF";
    };

    watch(
        () => props.settings,
        (newSettings) => {
            sizeCanvasRefs.value.forEach((canvas, size) => {
                generateSizePreviews(canvas);
            });
        },
        { immediate: true, deep: true }
    );
</script>

<template>
    <div class="w-full flex flex-flow-col flex-wrap">
        <!-- Sizes -->
        <div class="flex-1 w-full m-8">
            <div class="flex flex-flow-row justify-between">
                <h2 class="text text-4xl">Sizes</h2>
                <div class="flex flex-col w-max align-end">
                    <button
                        type="button"
                        class="block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer right-0"
                        @click="props.onClearEmote()"
                        aria-label="Clear selected emote">
                        Clear emote
                        <i
                            class="pi pi-times align-text-bottom ml-2"
                            aria-hidden="true"></i>
                    </button>
                    <button
                        type="button"
                        class="block bg-blue-500 text-white mt-2 px-4 py-2 rounded cursor-pointer"
                        @click="downloadEmotes()"
                        aria-label="Clear selected emote">
                        Download
                        <i
                            class="pi pi-download align-text-bottom ml-2"
                            aria-hidden="true"></i>
                    </button>
                </div>
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
                <div class="w-max relative">
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
            <div class="flex flex-flow-row justify-between items-center">
                <h2 class="text text-4xl">Previews</h2>
                <button
                    type="button"
                    class="bg-blue-500 text-white w-max px-4 py-2 rounded cursor-pointer align-end"
                    @click="downloadFullPreview()"
                    aria-label="Clear selected emote">
                    Download
                    <i
                        class="pi pi-download align-text-bottom ml-2"
                        aria-hidden="true"></i>
                </button>
            </div>
            <div class="preview-row mt-4">
                <div
                    class="relative w-max"
                    v-for="backgroundColor in props.settings.backgroundColors">
                    <canvas :ref="(el) => { setPreviewCanvasRef(backgroundColor, el as HTMLCanvasElement) }"></canvas>
                    <i
                        class="pi pi-download align-text-bottom p-4 absolute top-0 right-0 cursor-pointer"
                        :style="`color: ${getDownlodIconColor(backgroundColor)}`"
                        aria-hidden="true"
                        @click="downloadCanvas(backgroundColor)"></i>
                </div>
            </div>
        </div>
    </div>
</template>
