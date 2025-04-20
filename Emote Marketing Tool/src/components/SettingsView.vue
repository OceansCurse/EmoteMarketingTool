<script setup lang="ts">
    import { ref, watch } from "vue";
    import ColorList from "./ColorList.vue";
    import SizeList from "./SizeList.vue";
    import type { Settings } from "../types/Settings.ts";
    import { ColorPicker } from "vue3-colorpicker";
    import { ColorInputWithoutInstance } from "tinycolor2";

    const props = defineProps({
        settings: {
            required: true,
            type: Object as () => Settings,
        },
        onSizesUpdated: {
            required: true,
            type: Function,
        },
        onBackgroundColorsUpdated: {
            required: true,
            type: Function,
        },
        onHorizontalOuterPaddingUpdated: {
            required: true,
            type: Function,
        },
        onVerticalOuterPaddingUpdated: {
            required: true,
            type: Function,
        },
        onIconSpacingUpdated: {
            required: true,
            type: Function,
        },
        onVerticalAlignmentUpdated: {
            required: true,
            type: Function,
        },
        onShowSizeLabelsUpdated: {
            required: true,
            type: Function,
        },
        onSizeLabelColorUpdated: {
            required: true,
            type: Function,
        },
        onSizeLabelFontSizeUpdated: {
            required: true,
            type: Function,
        },
        onSizeLabelFontFamilyUpdated: {
            required: true,
            type: Function,
        },
        onLargestWidthUpdated: {
            required: true,
            type: Function,
        },
    });

    const selectedPreset = ref<string>("Twitch");
    const presets = ref<string[]>(["Twitch", "Discord", "YouTube"]);
    const selectedFont = ref<string>("Exo 2");
    const fonts = ref<string[]>(["Arial", "Exo 2", "Helvetica", "Times New Roman", "Courier New"]);
    const sizeLabelColor = ref<ColorInputWithoutInstance>("red");

    const onPresetChanged = (preset: String) => {
        console.log("Preset changed to");
        switch (preset) {
            case "Twitch":
                props.onBackgroundColorsUpdated(["#FFFFFFFF", "#000000FF", "#2299FFFF"]);
                props.onSizesUpdated([224, 112, 56, 28]);
                break;
            case "Discord":
                props.onBackgroundColorsUpdated(["#FFFFFFFF", "#000000FF", "#FF0000FF"]);
                props.onSizesUpdated([128, 64, 32]);
                break;
            case "YouTube":
                props.onBackgroundColorsUpdated(["#FF0000FF", "#FFFFFFFF", "#000000FF"]);
                props.onSizesUpdated([128, 64, 32]);
                break;
        }
    };

    watch(selectedPreset, (newPreset) => onPresetChanged(newPreset));
    watch(sizeLabelColor, (newColor) => props.onSizeLabelColorUpdated(newColor));
    watch(selectedFont, (newFont) => props.onSizeLabelFontFamilyUpdated(newFont));
</script>

<template>
    <h2 class="text text-3xl">Settings</h2>

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
              props.onBackgroundColorsUpdated(newColors);
            }"
            :onColorRemoved="(color: string) => {
              let newColors = props.settings.backgroundColors;
                const index = newColors.indexOf(color);
                if (index > -1) {
                  newColors.splice(index, 1).reverse();
                }
                props.onBackgroundColorsUpdated(newColors);
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
              props.onSizesUpdated(newSizes);
            }"
            :onSizeRemoved="(size: number) => {
              let newSizes = props.settings.sizes;
              const index = newSizes.indexOf(size);
                if (index > -1) {
                  newSizes.splice(index, 1);
                  newSizes.sort((a, b) => a - b).reverse();
                  props.onSizesUpdated(newSizes);
                }
            }" />
        <!-- Largest width checkbox -->
        <div class="mt-2 flex items-center gap-2">
            <input
                type="checkbox"
                id="largestWidthCheckbox"
                class="h-4 w-4"
                v-model="props.settings.useLargestWidth"
                @change="(e: Event) => {
            props.onLargestWidthUpdated(e.target.checked);
        }" />
            <label
                for="largestWidthCheckbox"
                class="text text-base leading-none pb-1">
                Use Largest Width
            </label>
        </div>
        <!-- Show size labels checkbox -->
        <div class="mt-2 flex items-center gap-2">
            <input
                type="checkbox"
                id="showSizesLabelCheckbox"
                class="h-4 w-4"
                v-model="props.settings.showSizeLabels"
                @change="(e: Event) => {
            props.onShowSizeLabelsUpdated(e.target.checked);
        }" />
            <label
                for="showSizesLabelCheckbox"
                class="text text-base leading-none pb-1">
                Show size labels
            </label>
        </div>
        <p class="mt-2">Size label color</p>
        <color-picker
            v-model:pureColor="sizeLabelColor"
            format="hex8"
            use-type="pure"
            pickerType="chrome" />
        <p class="mt-2">Size label size</p>
        <input
            type="number"
            v-model="props.settings.sizeLabelFontSize"
            class="mt-2"
            @change="(e: Event) => {
                props.onSizeLabelFontSizeUpdated(e.target.value as number);
            }" />
        <p class="mt-2">Size label font</p>
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
        <p>Vertical Alignement</p>
        <select
            v-model="props.settings.verticalAlignment"
            class="mt-2"
            @change="(e: Event) => {
                props.onVerticalAlignmentUpdated(e.target.value);
            }">
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
        </select>
    </section>
    <section class="mt-8">
        <h3 class="text text-2xl">Paddings</h3>
        <p>Horizontal Outer Padding</p>
        <input
            type="number"
            v-model="props.settings.horizontalOuterPadding"
            class="mt-2"
            @change="
                (e) => {
                    props.onHorizontalOuterPaddingUpdated(e.target.value as number);
                }
            " />
        <p>Vertical Outer Padding</p>
        <input
            type="number"
            v-model="props.settings.verticalOuterPadding"
            class="mt-2"
            @change="(e: Event) => {
                props.onVerticalOuterPaddingUpdated(e.target.value as number);
            }" />
        <p>Icon Spacing</p>
        <input
            type="number"
            v-model="props.settings.iconSpacing"
            class="mt-2"
            @change="(e: Event) => {
                props.onIconSpacingUpdated(e.target.value as number);
            }" />
    </section>
</template>
