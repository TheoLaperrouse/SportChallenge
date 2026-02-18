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

function formatSpeed(ms: string | null): string {
	if (!ms) return "0 km/h";
	return `${(Number(ms) * 3.6).toFixed(1)} km/h`;
}

function formatHeartrate(bpm: string | null): string {
	if (!bpm) return "-";
	return `${Math.round(Number(bpm))} bpm`;
}

function formatMaxDistance(meters: number | null): string {
	if (!meters) return "0 km";
	return `${(meters / 1000).toFixed(2)} km`;
}

const cards = [
	{ label: "Activités", getValue: () => props.stats?.totalActivities ?? 0 },
	{ label: "Distance totale", getValue: () => formatDistance(props.stats?.totalDistance ?? null) },
	{ label: "Temps total", getValue: () => formatDuration(props.stats?.totalMovingTime ?? null) },
	{ label: "Dénivelé total", getValue: () => formatElevation(props.stats?.totalElevation ?? null) },
	{ label: "Vitesse moy.", getValue: () => formatSpeed(props.stats?.avgSpeed ?? null) },
	{ label: "FC moyenne", getValue: () => formatHeartrate(props.stats?.avgHeartrate ?? null) },
	{ label: "Distance max", getValue: () => formatMaxDistance(props.stats?.maxDistance ?? null) },
];
</script>

<template>
	<div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-7">
		<div
			v-for="card in cards"
			:key="card.label"
			class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6"
		>
			<p class="text-sm text-concrete">{{ card.label }}</p>
			<p class="mt-1 text-xl font-bold text-punch sm:text-2xl">{{ card.getValue() }}</p>
		</div>
	</div>
</template>
