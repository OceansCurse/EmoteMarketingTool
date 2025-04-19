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
    });

    const originalImage = ref<HTMLImageElement | null>(null);

    const clearEmote = () => {
        originalImage.value = null;
    };
</script>

<template>
    <div class="w-full h-full relative">
        <Transition name="fade">
            <div
                v-if="originalImage == null"
                class="w-full h-full absolute"
            >
                <FileSelector :onImageSelected="(image: HTMLImageElement) => {originalImage = image}" />
            </div>
        </Transition>
        <Transition name="fade">
            <div
                v-if="originalImage != null"
                class="absolute z-100 right-0"
            >
                <button
                    type="button"
                    class="m-8 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer align-middle"
                    @click="clearEmote"
                    aria-label="Clear selected emote"
                >
                    Clear emote
                    <i
                        class="pi pi-times align-text-bottom ml-2"
                        aria-hidden="true"
                    ></i>
                </button>
            </div>
        </Transition>
        <Transition name="fade">
            <div
                v-if="originalImage != null"
                class="absolute w-full"
            >
                <ImagePreviewList
                    :settings="props.settings"
                    :originalImage="originalImage"
                />
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
