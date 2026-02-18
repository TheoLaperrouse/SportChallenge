<script setup lang="ts">
import { computed } from "vue";
import type { Activity } from "../types/index.js";

const props = defineProps<{
	activities: Activity[];
}>();

interface PersonalRecord {
	label: string;
	value: string;
	activityName: string | null;
	date: string;
}

function formatDate(date: string | null): string {
	if (!date) return "";
	return new Date(date).toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatDuration(seconds: number | null): string {
	if (!seconds) return "0h 0m";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${h}h${String(m).padStart(2, "0")}`;
}

const records = computed<PersonalRecord[]>(() => {
	if (props.activities.length === 0) return [];

	const longestDistance = props.activities.reduce((max, a) =>
		(a.distance ?? 0) > (max.distance ?? 0) ? a : max,
	);

	const mostElevation = props.activities.reduce((max, a) =>
		(a.totalElevationGain ?? 0) > (max.totalElevationGain ?? 0) ? a : max,
	);

	const fastestSpeed = props.activities.reduce((max, a) =>
		(a.maxSpeed ?? 0) > (max.maxSpeed ?? 0) ? a : max,
	);

	const longestTime = props.activities.reduce((max, a) =>
		(a.movingTime ?? 0) > (max.movingTime ?? 0) ? a : max,
	);

	return [
		{
			label: "Plus longue distance",
			value: `${((longestDistance.distance ?? 0) / 1000).toFixed(2)} km`,
			activityName: longestDistance.name,
			date: formatDate(longestDistance.startDate),
		},
		{
			label: "Plus grand dénivelé",
			value: `${Math.round(mostElevation.totalElevationGain ?? 0)} m`,
			activityName: mostElevation.name,
			date: formatDate(mostElevation.startDate),
		},
		{
			label: "Vitesse max",
			value: `${((fastestSpeed.maxSpeed ?? 0) * 3.6).toFixed(1)} km/h`,
			activityName: fastestSpeed.name,
			date: formatDate(fastestSpeed.startDate),
		},
		{
			label: "Plus longue durée",
			value: formatDuration(longestTime.movingTime),
			activityName: longestTime.name,
			date: formatDate(longestTime.startDate),
		},
	];
});
</script>

<template>
	<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
		<h3 class="mb-4 text-sm font-medium text-offwhite">Records Personnels</h3>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div
				v-for="record in records"
				:key="record.label"
				class="rounded-lg border border-dark-border bg-dark-elevated p-3"
			>
				<p class="text-xs text-concrete">{{ record.label }}</p>
				<p class="mt-1 text-xl font-bold text-punch">{{ record.value }}</p>
				<p v-if="record.activityName" class="mt-2 truncate text-xs text-offwhite">
					{{ record.activityName }}
				</p>
				<p v-if="record.date" class="text-xs text-concrete">{{ record.date }}</p>
			</div>
			<div v-if="records.length === 0" class="col-span-full py-8 text-center text-sm text-concrete">
				Aucune activité
			</div>
		</div>
	</div>
</template>
