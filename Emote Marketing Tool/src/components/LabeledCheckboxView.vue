<script setup lang="ts">
    import { ref } from "vue";

    const props = defineProps({
        label: {
            required: true,
            type: String,
        },
        checked: {
            required: true,
            type: Boolean,
        },
    });
    const emit = defineEmits(["update:checked"]);

    const checked = ref(props.checked);
</script>
<template>
    <div class="mt-2 flex items-center gap-2">
        <input
            type="checkbox"
            :id="label"
            class="h-4 w-4"
            v-model="checked"
            @change="(e: Event) => {
                if (e.target == null) return;
                const value = (e.target as HTMLInputElement).checked;
                emit('update:checked', value)
            }" />
        <label
            :for="label"
            class="text text-base leading-none pb-1">
            {{ props.label }}
        </label>
    </div>
</template>
