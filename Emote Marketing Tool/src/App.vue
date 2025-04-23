<script setup lang="ts">
    import { ref } from "vue";
    import Content from "./components/Content.vue";
    import SettingsView from "./components/SettingsView.vue";
    import type { Settings } from "./types/Settings.ts";

    const settings = ref<Settings>({
        fileName: "",
        fileType: "png",
        sizes: [112, 56, 28],
        backgroundColors: ["#FFFFFFFF", "#18181BFF"],
        horizontalOuterPadding: 64,
        verticalOuterPadding: 64,
        iconSpacing: 64,
        verticalAlignment: "bottom",
        hideOriginal: false,
        useLargestWidth: false,
        showSizeLabels: true,
        sizeLabelColors: ["#000000FF", "#FFFFFFFF"],
        sizeLabelFontSize: 16,
        sizeLabelFontFamily: "Exo 2",
        sizeLabelsOccupySpace: true,
    });
</script>

<template>
    <div class="flex flex-col h-dvh">
        <!-- Header -->
        <header class="px-8 py-4 shrink-0 bg-neutral-100 text-white border-b-2 border-neutral-300">
            <h1 class="text-4xl text-neutral-900">Emote Marketing Tool</h1>
        </header>
        <!-- Flex container for main and aside -->
        <div class="flex flex-col lg:flex-row p-4 lg:p-8 gap-4 lg:gap-8 bg-neutral-200 h-full overflow-auto">
            <!-- Main Content -->
            <main class="w-full h-max lg:h-full lg:flex-1 bg-neutral-100 rounded-2xl shadow-lg lg:overflow-auto">
                <Content
                    :settings="settings"
                    :onSettingsUpdated="(newSettings: Settings) => settings = newSettings" />
            </main>
            <!-- Sidebar -->
            <aside class="w-full lg:w-[400px] bg-neutral-100 p-8 rounded-2xl shadow-lg lg:overflow-auto">
                <SettingsView
                    :settings="settings"
                    :onSettingsUpdated="(newSettings: Settings) => settings = newSettings" />
            </aside>
        </div>
    </div>
</template>
