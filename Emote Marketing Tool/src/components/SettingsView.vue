<script setup lang="ts">
    import { ref, watch } from "vue";
    import ColorList from "./ColorList.vue";
    import SizeList from "./SizeList.vue";
    import type { Settings } from "../types/Settings.ts";
    import { ColorPicker } from "vue3-colorpicker";
    import { ColorInputWithoutInstance } from "tinycolor2";
    import LabeledCheckboxView from "./LabeledCheckboxView.vue";

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

    const selectedPreset = ref<string>("Twitch");
    const presets = ref<string[]>(["Twitch", "Discord", "YouTube"]);
    const selectedFont = ref<string>("Exo 2");
    const fonts = ref<string[]>(["Arial", "Exo 2", "Helvetica", "Times New Roman", "Courier New"]);
    const sizeLabelColors = ref<string[]>(props.settings.sizeLabelColors);

    const onPresetChanged = (preset: String) => {
        let newBackgroundColors = props.settings.backgroundColors;
        let newSizes = props.settings.sizes;

        switch (preset) {
            case "Twitch":
                newBackgroundColors = ["#FFFFFFFF", "#000000FF", "#2299FFFF"];
                newSizes = [224, 112, 56, 28];
                break;
            case "Discord":
                newBackgroundColors = ["#FFFFFFFF", "#000000FF", "#FF0000FF"];
                newSizes = [128, 64, 32];
                break;
            case "YouTube":
                newBackgroundColors = ["#FF0000FF", "#FFFFFFFF", "#000000FF"];
                newSizes = [128, 64, 32];
                break;
        }
        props.onSettingsUpdated({
            ...props.settings,
            backgroundColors: newBackgroundColors,
            sizes: newSizes,
        });
    };

    watch(selectedPreset, (newPreset) => onPresetChanged(newPreset));
    watch(sizeLabelColors, (sizeLabelColors) => props.onSettingsUpdated({ ...props.settings, sizeLabelColors }));
    watch(selectedFont, (newFont) => props.onSettingsUpdated({ ...props.settings, sizeLabelFontFamily: newFont }));
</script>

<template>
    <h2 class="text text-3xl">Settings</h2>

    <!-- Export options -->
    <section class="mt-2">
        <h3 class="text text-2xl">Export</h3>
        <p class="text-lg">File name</p>
        <input
            type="text"
            v-model="props.settings.fileName"
            class="mt-2"
            @change="(e: Event) => {
                props.onSettingsUpdated({ ...props.settings, fileName: e.target.value });
            }" />
        <p class="text-lg">File type</p>
        <select
            v-model="props.settings.fileType"
            class="mt-2"
            @change="(e: Event) => {
                props.onSettingsUpdated({ ...props.settings, exportFormat: e.target.value });
            }">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WEBP</option>
        </select>
    </section>

    <!-- Presets dropdown -->
    <section class="mt-2">
        <h3 class="text text-2xl">Presets</h3>
        <select
            v-model="selectedPreset"
            class="mt-2">
            <option
                v-for="preset in presets"
                :key="preset"
                :value="preset">
                {{ preset }}
            </option>
        </select>
    </section>

    <section class="mt-8">
        <h3 class="text text-2xl">Backgrounds</h3>
        <ColorList
            class="mt-2"
            :colors="props.settings.backgroundColors"
            :onColorAdded="(color: string) => {
              let newColors = props.settings.backgroundColors;
              newColors.push(color);
              props.onSettingsUpdated({ ...props.settings, backgroundColors: newColors });
            }"
            :onColorRemoved="(color: string) => {
              let newColors = props.settings.backgroundColors;
                const index = newColors.indexOf(color);
                if (index > -1) {
                  newColors.splice(index, 1).reverse();
                }
                props.onSettingsUpdated({ ...props.settings, backgroundColors: newColors });
              }" />
    </section>

    <section class="mt-8">
        <h3 class="text text-2xl">Sizes</h3>
        <SizeList
            class="mt-2"
            :sizes="props.settings.sizes"
            :onSizeAdded="(size: number) => {
              let newSizes = props.settings.sizes;
              newSizes.push(size);
              newSizes.sort((a, b) => a - b).reverse();
              props.onSettingsUpdated({ ...props.settings, sizes: newSizes });
            }"
            :onSizeRemoved="(size: number) => {
              let newSizes = props.settings.sizes;
              const index = newSizes.indexOf(size);
                if (index > -1) {
                  newSizes.splice(index, 1);
                  newSizes.sort((a, b) => a - b).reverse();
                  props.onSettingsUpdated({ ...props.settings, sizes: newSizes });
                }
            }" />
        <p class="mt-2 text-lg">Size label color</p>
        <div
            v-for="(color, index) in props.settings.backgroundColors"
            :key="index"
            class="flex items-center my-2">
            <div
                class="inline-block w-6 h-6 rounded mr-2 border-1 border-neutral-400"
                :style="{ background: color as string }"
                role="img"
                :aria-label="`Color swatch: ${color}`"></div>
            <span class="mr-2">=></span>
            <color-picker
                v-model:pureColor="sizeLabelColors[index]"
                format="hex8"
                use-type="pure"
                pickerType="chrome" />
        </div>

        <!-- Largest width checkbox -->
        <LabeledCheckboxView
            :checked="props.settings.useLargestWidth"
            label="Use largest width"
            @update:checked="(checked: boolean) =>{
                props.onSettingsUpdated({ ...props.settings, useLargestWidth: checked });
            }" />

        <!-- Show size labels checkbox -->
        <LabeledCheckboxView
            :checked="props.settings.showSizeLabels"
            label="Show size labels"
            @update:checked="(checked: boolean) =>{
                props.onSettingsUpdated({ ...props.settings, showSizeLabels: checked });
            }" />

        <!-- Size labels occupy space -->
        <LabeledCheckboxView
            :checked="props.settings.sizeLabelsOccupySpace"
            label="Size labels occupy space"
            @update:checked="(checked: boolean) => {
                props.onSettingsUpdated({ ...props.settings, sizeLabelsOccupySpace: checked });
            }" />

        <!-- Size labels occupy space -->
        <LabeledCheckboxView
            :checked="props.settings.hideOriginal"
            label="Hide original"
            @update:checked="(checked: boolean) => {
                props.onSettingsUpdated({ ...props.settings, hideOriginal: checked });
            }" />

        <p class="mt-2 text-lg">Size label size</p>
        <input
            type="number"
            v-model="props.settings.sizeLabelFontSize"
            class="mt-2"
            @change="(e: Event) => {
                props.onSizeLabelFontSizeUpdated(e.target.value as number);
            }" />
        <p class="mt-2 text-lg">Size label font</p>
        <select
            v-model="selectedFont"
            class="mt-2"
            :style="{ fontFamily: selectedFont }">
            >
            <option
                v-for="font in fonts"
                :key="font"
                :value="font"
                :style="{ fontFamily: font }">
                {{ font }}
            </option>
        </select>
    </section>
    <section class="mt-8">
        <h3 class="text text-2xl">Alignments</h3>
        <p class="text-lg">Vertical Alignement</p>
        <select
            v-model="props.settings.verticalAlignment"
            class="mt-2"
            @change="(e: Event) => {
                props.onSettingsUpdated({ ...props.settings, verticalAlignment: e.target.value as 'top' | 'middle' | 'bottom' });
            }">
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
        </select>
    </section>
    <section class="mt-8">
        <h3 class="text text-2xl">Paddings</h3>
        <p class="text-lg">Horizontal Outer Padding</p>
        <input
            type="number"
            v-model="props.settings.horizontalOuterPadding"
            class="mt-2"
            @change="
                (e) => {
                    props.onSettingsUpdated({ ...props.settings, horizontalOuterPadding: e.target.value as number });
                }
            " />
        <p class="text-lg">Vertical Outer Padding</p>
        <input
            type="number"
            v-model="props.settings.verticalOuterPadding"
            class="mt-2"
            @change="(e: Event) => {
                props.onSettingsUpdated({ ...props.settings, verticalOuterPadding: e.target.value as number });
            }" />
        <p class="text-lg">Icon Spacing</p>
        <input
            type="number"
            v-model="props.settings.iconSpacing"
            class="mt-2"
            @change="(e: Event) => {
                props.onSettingsUpdated({ ...props.settings, iconSpacing: e.target.value as number });
            }" />
    </section>
</template>
