<script setup lang="ts">
import type { Activity } from "../types/index.js";

defineProps<{
	activities: Activity[];
}>();

function formatDistance(meters: number | null): string {
	if (!meters) return "-";
	return `${(meters / 1000).toFixed(2)} km`;
}

function formatDuration(seconds: number | null): string {
	if (!seconds) return "-";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return h > 0 ? `${h}h${String(m).padStart(2, "0")}m` : `${m}m${String(s).padStart(2, "0")}s`;
}

function formatDate(date: string | null): string {
	if (!date) return "-";
	return new Date(date).toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatSpeed(mps: number | null): string {
	if (!mps) return "-";
	return `${(mps * 3.6).toFixed(1)} km/h`;
}
</script>

<template>
	<div class="overflow-x-auto rounded-lg border border-dark-border bg-dark-card">
		<div class="max-h-122.5 overflow-y-auto">
			<table class="min-w-full divide-y divide-dark-border">
			<thead class="sticky top-0 z-10 bg-dark-elevated">
				<tr>
					<th class="px-2 py-3 text-left text-xs font-medium uppercase text-concrete sm:px-4">Date</th>
					<th class="px-2 py-3 text-left text-xs font-medium uppercase text-concrete sm:px-4">Nom</th>
					<th class="hidden px-2 py-3 text-left text-xs font-medium uppercase text-concrete sm:px-4 md:table-cell">Type</th>
					<th class="px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4">Distance</th>
					<th class="px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4">Durée</th>
					<th class="hidden px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4 lg:table-cell">D+</th>
					<th class="hidden px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4 lg:table-cell">Vitesse moy.</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-dark-border">
				<tr v-for="activity in activities" :key="activity.id" class="hover:bg-dark-elevated/50">
					<td class="whitespace-nowrap px-2 py-3 text-sm text-concrete sm:px-4">
						{{ formatDate(activity.startDate) }}
					</td>
					<td class="px-2 py-3 text-sm font-medium text-offwhite sm:px-4">
						{{ activity.name }}
					</td>
					<td class="hidden px-2 py-3 text-sm text-concrete sm:px-4 md:table-cell">
						{{ activity.sportType ?? activity.type }}
					</td>
					<td class="whitespace-nowrap px-2 py-3 text-right text-sm font-semibold text-punch sm:px-4">
						{{ formatDistance(activity.distance) }}
					</td>
					<td class="whitespace-nowrap px-2 py-3 text-right text-sm text-offwhite sm:px-4">
						{{ formatDuration(activity.movingTime) }}
					</td>
					<td class="hidden whitespace-nowrap px-2 py-3 text-right text-sm text-offwhite sm:px-4 lg:table-cell">
						{{ activity.totalElevationGain ? `${Math.round(activity.totalElevationGain)} m` : '-' }}
					</td>
					<td class="hidden whitespace-nowrap px-2 py-3 text-right text-sm text-offwhite sm:px-4 lg:table-cell">
						{{ formatSpeed(activity.averageSpeed) }}
					</td>
				</tr>
				<tr v-if="activities.length === 0">
					<td colspan="7" class="px-4 py-8 text-center text-sm text-concrete">
						Aucune activité pour le moment. Vos activités sont synchronisées automatiquement.
					</td>
				</tr>
			</tbody>
			</table>
		</div>
	</div>
</template>
