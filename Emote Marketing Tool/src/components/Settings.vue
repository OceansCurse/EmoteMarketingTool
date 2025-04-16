<script setup lang="ts">
    import { ref, watch } from "vue";
    import ColorList from "./ColorList.vue";
    import SizeList from "./SizeList.vue";

    const props = defineProps({
        sizes: {
            required: true,
            type: Array as () => number[],
        },
        backgroundColors: {
            required: true,
            type: Array as () => string[],
        },
        onSizesUpdated: {
            required: true,
            type: Function,
        },
        onBackgroundColorsUpdated: {
            required: true,
            type: Function,
        },
    });

    const selectedPreset = ref<String>("Twitch");
    const presets = ref<String[]>(["Twitch", "Discord", "YouTube"]);

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
</script>

<template>
    <h2 class="text text-3xl">Settings</h2>

    <!-- Presets dropdown -->
    <section class="mt-4">
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

    <section class="mt-4">
        <h3 class="text text-2xl">Backgrounds</h3>
        <ColorList
            class="mt-4"
            :colors="backgroundColors"
            :onColorAdded="(color: string) => {
              let newColors = props.backgroundColors;
              newColors.push(color);
              props.onBackgroundColorsUpdated(newColors);
            }"
            :onColorRemoved="(color: string) => {
              let newColors = props.backgroundColors;
                const index = newColors.indexOf(color);
                if (index > -1) {
                  newColors.splice(index, 1).reverse();
                }
                props.onBackgroundColorsUpdated(newColors);
              }" />
    </section>

    <section class="mt-4">
        <h3 class="text text-2xl">Sizes</h3>
        <SizeList
            :sizes="props.sizes"
            :onSizeAdded="(size: number) => {
              let newSizes = props.sizes;
              newSizes.push(size);
              newSizes.sort((a, b) => a - b).reverse();
              props.onSizesUpdated(newSizes);
            }"
            :onSizeRemoved="(size: number) => {
              let newSizes = props.sizes;
              const index = newSizes.indexOf(size);
                if (index > -1) {
                  newSizes.splice(index, 1);
                  newSizes.sort((a, b) => a - b).reverse();
                  props.onSizesUpdated(newSizes);
                }
            }" />
    </section>
</template>
