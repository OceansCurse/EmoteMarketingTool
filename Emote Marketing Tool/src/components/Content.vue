<script setup lang="ts">
    import { ref } from "vue";
    import ColorList from "./ColorList.vue";
    import SizeList from "./SizeList.vue";
    import ImagePreviewList from "./ImagePreviewList.vue";

    const selectedPreset = ref<String>("Twitch");
    const presets = ref<String[]>(["Twitch", "Discord", "YouTube"]);
    const backgroundColors = ref<String[]>(["#FFFFFFFF", "#000000FF", "#2299FFFF"]);
    const sizes = ref<number[]>([224, 112, 56, 28]);

    const fileInput = ref<HTMLInputElement | null>(null);
    const originalImage = ref<HTMLImageElement | null>(null);
    const promoCanvasRef = ref<HTMLCanvasElement | null>(null);

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
                // setOriginalImage();
                // generatePreviews();
                // drawPreviewImage(promoCanvasRef.value as HTMLCanvasElement);
            };
        };
        reader.readAsDataURL(file);
    };

    const onPresetChanged = (preset: String) => {
        console.log("Preset changed to:", preset);
        switch (preset) {
            case "Twitch":
                backgroundColors.value = ["#FFFFFFFF", "#000000FF", "#2299FFFF"];
                sizes.value = [224, 112, 56, 28];
                break;
            case "Discord":
                backgroundColors.value = ["#FFFFFFFF", "#000000FF", "#FF0000FF"];
                sizes.value = [128, 64, 32];
                break;
            case "YouTube":
                backgroundColors.value = ["#FF0000FF", "#FFFFFFFF", "#000000FF"];
                sizes.value = [128, 64, 32];
                break;
        }
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
</script>

<template>
    <div class="emote-uploader m-12">
        <h2 class="text text-2xl">Upload Emote</h2>
        <input
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            ref="fileInput"
        />

        <!-- Presets dropdown -->
        <section class="mt-4">
            <h2 class="text text-2xl">Presets</h2>
            <select
                v-model="selectedPreset"
                :v-on:change="onPresetChanged(selectedPreset)"
                class="mt-2"
            >
                <option
                    v-for="preset in presets"
                    :key="preset"
                    :value="preset"
                >
                    {{ preset }}
                </option>
            </select>
        </section>

        <ColorList
            class="mt-4"
            title="Backgrounds"
            :colors="backgroundColors"
            :onColorAdded="(color: String) => backgroundColors.push(color)"
            :onColorRemoved="(color: String) => {
                const index = backgroundColors.indexOf(color);
                if (index > -1) {
                    backgroundColors.splice(index, 1).reverse();
                }
            }"
        />

        <SizeList
            title="Backgrounds"
            :sizes="sizes"
            :onSizeAdded="(size: number) => {
                sizes.push(size)
                sizes = sizes.sort((a, b) => a - b).reverse();
            }"
            :onSizeRemoved="(size: number) => {
                const index = sizes.indexOf(size);
                if (index > -1) {
                    sizes.splice(index, 1);
                    sizes = sizes.sort((a, b) => a - b).reverse();
                }
            }"
        />

        <ImagePreviewList
            :sizes="sizes"
            :originalImage="originalImage"
        />

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
