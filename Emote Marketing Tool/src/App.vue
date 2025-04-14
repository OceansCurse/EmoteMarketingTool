<script setup lang="ts">
import { ref } from "vue";
import Content from "./components/Content.vue";
import Settings from "./components/Settings.vue";

const sizes = ref<number[]>([224, 112, 56, 28]);
</script>

<template>
  <div class="flex flex-col h-dvh">
    <!-- Header -->
    <header
      class="px-8 py-4 shrink-0 bg-neutral-100 text-white border-b-2 border-neutral-300"
    >
      <h1 class="text-4xl text-neutral-900">Emote Marketing Tool</h1>
    </header>
    <!-- Flex container for main and aside -->
    <div
      class="flex flex-col md:flex-row flex-grow bg-neutral-200 overflow-auto"
    >
      <!-- Main Content -->
      <main class="flex-1 h-auto">
        <Content :sizes="sizes" />
      </main>
      <!-- Sidebar -->
      <div class="w-100 right-4">
        <aside
          class="w-100 h-max bg-neutral-100 m-4 p-8 rounded-2xl shadow-l absolute right-4"
        >
          <Settings :sizes="sizes" />
        </aside>
      </div>
    </div>
  </div>
</template>
