<script setup lang="ts">
import type { PersonalStats } from "../types/index.js";

const props = defineProps<{
	stats: PersonalStats | null;
}>();

function formatDistance(meters: string | null): string {
	if (!meters) return "0 km";
	return `${(Number(meters) / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: string | null): string {
	if (!seconds) return "0h";
	const totalSec = Number(seconds);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	return `${h}h ${m}m`;
}

function formatElevation(meters: string | null): string {
	if (!meters) return "0 m";
	return `${Math.round(Number(meters))} m`;
}

const cards = [
	{ label: "Activités", getValue: () => props.stats?.totalActivities ?? 0 },
	{ label: "Distance totale", getValue: () => formatDistance(props.stats?.totalDistance ?? null) },
	{ label: "Temps total", getValue: () => formatDuration(props.stats?.totalMovingTime ?? null) },
	{ label: "Dénivelé total", getValue: () => formatElevation(props.stats?.totalElevation ?? null) },
];
</script>

<template>
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		<div
			v-for="card in cards"
			:key="card.label"
			class="rounded-lg border border-dark-border bg-dark-card p-6"
		>
			<p class="text-sm text-concrete">{{ card.label }}</p>
			<p class="mt-1 text-2xl font-bold text-punch">{{ card.getValue() }}</p>
		</div>
	</div>
</template>
