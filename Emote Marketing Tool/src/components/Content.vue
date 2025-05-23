<script setup lang="ts">
    import { ref } from "vue";
    import ImagePreviewList from "./ImagePreviewList.vue";
    import FileSelector from "./FileSelector.vue";
    import type { Settings } from "../types/Settings.ts";

    const props = defineProps({
        settings: {
            required: true,
            type: Object as () => Settings,
        },
        onSettingsUpdated: {
            required: true,
            type: Function,
        },
    });

    const originalImage = ref<HTMLImageElement | null>(null);

    const clearEmote = () => {
        originalImage.value = null;
    };
</script>

<template>
    <div class="w-full h-full">
        <Transition
            name="fade"
            mode="out-in">
            <div
                v-if="originalImage == null"
                class="w-full h-full flex flex-col items-center justify-center">
                <FileSelector
                    :onImageSelected="(image: HTMLImageElement, fileName: string, fileType: string) => {
                        originalImage = image;
                        props.onSettingsUpdated({
                            ...props.settings,
                            exportFormat: fileType,
                            fileName: fileName,
                            fileType: fileType,
                        }
                );
            }" />
            </div>
            <div
                v-else
                class="w-full">
                <ImagePreviewList
                    :settings="props.settings"
                    :originalImage="originalImage"
                    :onClearEmote="clearEmote" />
            </div>
        </Transition>
    </div>
</template>
<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 300ms ease;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
