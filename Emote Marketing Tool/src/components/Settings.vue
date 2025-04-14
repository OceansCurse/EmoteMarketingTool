<script setup lang="ts">
import { ref } from "vue";
import ColorList from "./ColorList.vue";
import SizeList from "./SizeList.vue";

const props = defineProps({
  sizes: {
    required: true,
    type: Array as () => number[],
  },
});

const selectedPreset = ref<String>("Twitch");
const presets = ref<String[]>(["Twitch", "Discord", "YouTube"]);
const backgroundColors = ref<String[]>(["#FFFFFFFF", "#000000FF", "#2299FFFF"]);

const onPresetChanged = (preset: String) => {
  console.log("Preset changed to:", preset);
  switch (preset) {
    case "Twitch":
      backgroundColors.value = ["#FFFFFFFF", "#000000FF", "#2299FFFF"];
      props.sizes = [224, 112, 56, 28];
      break;
    case "Discord":
      backgroundColors.value = ["#FFFFFFFF", "#000000FF", "#FF0000FF"];
      props.sizes = [128, 64, 32];
      break;
    case "YouTube":
      backgroundColors.value = ["#FF0000FF", "#FFFFFFFF", "#000000FF"];
      props.sizes = [128, 64, 32];
      break;
  }
};
</script>

<template>
  <h2 class="text text-3xl">Settings</h2>

  <!-- Presets dropdown -->
  <section class="mt-4">
    <h3 class="text text-2xl">Presets</h3>
    <select
      v-model="selectedPreset"
      :v-on:change="onPresetChanged(selectedPreset)"
      class="mt-2"
    >
      <option v-for="preset in presets" :key="preset" :value="preset">
        {{ preset }}
      </option>
    </select>
  </section>

  <section class="mt-4">
    <h3 class="text text-2xl">Backgrounds</h3>
    <ColorList
      class="mt-4"
      title="Backgrounds"
      :colors="backgroundColors"
      :onColorAdded="(color: String) => backgroundColors.push(color)"
      :onColorRemoved="(color: String) => {
                const index = backgroundColors.indexOf(color);
                if (index > -1) {
                    backgroundColors.splice(index, 1).reverse();
                }
            }"
    />
  </section>

  <section class="mt-4">
    <h3 class="text text-2xl">Sizes</h3>
    <SizeList
      title="Backgrounds"
      :sizes="props.sizes"
      :onSizeAdded="(size: number) => {
                props.sizes.push(size)
                props.sizes = props.sizes.sort((a, b) => a - b).reverse();
            }"
      :onSizeRemoved="(size: number) => {
                const index = sizes.indexOf(size);
                if (index > -1) {
                  props.sizes.splice(index, 1);
                  props.sizes = props.sizes.sort((a, b) => a - b).reverse();
                }
            }"
    />
  </section>
</template>
