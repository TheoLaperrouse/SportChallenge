<script setup lang="ts">
import type { ActivityType } from "../types/index.js";

defineProps<{
	modelValue: ActivityType;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: ActivityType];
}>();

const types: { value: ActivityType; label: string }[] = [
	{ value: "Run", label: "Course / Trail" },
	{ value: "Ride", label: "Vélo" },
	{ value: "Swim", label: "Natation" },
];
</script>

<template>
	<div class="flex gap-1 rounded-lg bg-dark-elevated p-1">
		<button
			v-for="type in types"
			:key="type.value"
			@click="emit('update:modelValue', type.value)"
			:class="[
				'rounded-md px-4 py-2 text-sm font-medium transition-colors',
				modelValue === type.value
					? 'bg-punch text-dark shadow'
					: 'text-concrete hover:text-offwhite',
			]"
		>
			{{ type.label }}
		</button>
	</div>
</template>
