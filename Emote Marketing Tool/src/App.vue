<script setup lang="ts">
    import { ref } from "vue";
    import Content from "./components/Content.vue";
    import SettingsView from "./components/SettingsView.vue";
    import type { Settings } from "./types/Settings.ts";

    const settings = ref<Settings>({
        sizes: [224, 112, 56, 28],
        backgroundColors: ["#FFFFFFFF", "#000000FF", "#2299FFFF"],
        horizontalOuterPadding: 32,
        verticalOuterPadding: 32,
        iconSpacing: 16,
    });

    const getScrollbarWidth = () => {
        const outer = document.createElement("div");
        outer.style.overflow = "scroll";
        document.body.appendChild(outer);
        const width = outer.offsetWidth - outer.clientWidth;
        document.body.removeChild(outer);
        return width;
    };
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
            <main class="flex-1 h-auto w-full bg-neutral-100 rounded-2xl shadow-l mr-4">
                <Content :settings="settings" />
            </main>
            <!-- Sidebar -->
            <aside
                class="h-max bg-neutral-100 p-8 rounded-2xl shadow-l"
                :class="'right-[' + getScrollbarWidth() + 'px]'"
            >
                <div class="">
                    <SettingsView
                        :settings="settings"
                        :onSizesUpdated="(newSizes: number[]) => settings.sizes = newSizes"
                        :onBackgroundColorsUpdated="(newBackgroundColors: string[]) => settings.backgroundColors = newBackgroundColors"
                        :onHorizontalOuterPaddingUpdated="(newPadding: number) => settings.horizontalOuterPadding = newPadding"
                        :onVerticalOuterPaddingUpdated="(newPadding: number) => settings.verticalOuterPadding = newPadding"
                        :onIconSpacingUpdated="(newSpacing: number) => settings.iconSpacing = newSpacing"
                    />
                </div>
            </aside>
        </div>
    </div>
</template>
