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
    <input
        class="w-full h-200 bg-neutral-800 rounded-2xl"
        type="file"
        accept="image/*"
        @change="handleFileUpload"
        ref="fileInput"
    />
</template>
