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
            const fileName = file.name;
            let fileType = file.type.split("/")[1] as string;
            if (fileType == "jpeg") {
                fileType = "jpg";
            }
            // strip the file extension from the file name
            const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");

            image.src = e.target?.result as string;
            image.onload = () => {
                props.onImageSelected(image, fileNameWithoutExtension, fileType);
            };
        };
        reader.readAsDataURL(file);
    };
</script>

<template>
    <div class="h-full w-full flex flex-flow-row flex-wrap justify-center items-center">
        <section class="relative h-max w-max grid grid-flow-col justify-self-center self-center py-4 lg:py-8">
            <div class="p-4 lg:p-12 bg-neutral-600/50 justify-self-center self-center rounded-4xl inset-shadow-sm inset-shadow-neutral-900">
                <div class="text-neutral-100 text-center border-neutral-900/50 border-4 border-dashed rounded-4xl p-4 lg:p-12">
                    <i class="pi pi-file-arrow-up text-8xl mb-4"></i>
                    <h2 class="text text-l md:text-xl lg:text-2xl">Click to choose a file</h2>
                    <p class="text text-xl my-4">or</p>
                    <h2 class="text text-l md:text-xl lg:text-2xl">Drag a file in here</h2>
                </div>
            </div>
            <div class="w-full h-full justify-self-center self-center absolute">
                <input
                    class="opacity-0 w-full h-full"
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload"
                    ref="fileInput" />
            </div>
        </section>
        <section class="w-max h-max max-w-120 p-8">
            <h2 class="text text-xl md:text-2xl lg:text-4xl mb-4">Emotes Resizer and Markerting Tool</h2>
            <p class="">
                Upload an image to design professional emotes for Twitch, Discord, or social media. Customize colors, text, and styles to match your brand—all in minutes. Everything is processed in
                your browser, so no data is transferred or stored.
            </p>
            <p>
                <a
                    class="text text-blue-400"
                    href="/privacy-policy/"
                    target="_blank"
                    >Privacy Policy</a
                >
            </p>
        </section>
    </div>
</template>
