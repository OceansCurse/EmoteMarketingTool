<script setup lang="ts">
    import { ref } from "vue";
    import Content from "./components/Content.vue";
    import SettingsView from "./components/SettingsView.vue";
    import type { Settings } from "./types/Settings.ts";

    const settings = ref<Settings>({
        fileName: "",
        fileType: "png",
        sizes: [112, 56, 28],
        backgroundColors: ["#FFFFFFFF", "#000000FF", "#2299FFFF"],
        horizontalOuterPadding: 64,
        verticalOuterPadding: 64,
        iconSpacing: 64,
        verticalAlignment: "bottom",
        useLargestWidth: false,
        showSizeLabels: true,
        sizeLabelColors: ["#000000FF", "#FFFFFFFF", "#FFFFFFFF"],
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
        <div class="flex flex-col md:flex-row flex-grow p-4 bg-neutral-200 overflow-auto">
            <!-- Main Content -->
            <main class="flex-1 h-full w-full bg-neutral-100 rounded-2xl shadow-l mr-4 overflow-auto">
                <Content
                    :settings="settings"
                    :onSettingsUpdated="(newSettings: Settings) => settings = newSettings" />
                />
            </main>
            <!-- Sidebar -->
            <aside class="h-full bg-neutral-100 p-8 rounded-2xl shadow-l overflow-auto">
                <div class="">
                    <SettingsView
                        :settings="settings"
                        :onSettingsUpdated="(newSettings: Settings) => settings = newSettings" />
                </div>
            </aside>
        </div>
    </div>
</template>
