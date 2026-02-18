<script setup lang="ts">
import { computed } from "vue";
import type { LeaderboardEntry } from "../types/index.js";

const props = defineProps<{
	leaderboard: LeaderboardEntry[];
}>();

interface ElevationRatioEntry {
	userId: number;
	firstname: string | null;
	lastname: string | null;
	avatarUrl: string | null;
	ratio: number;
	totalElevation: string | null;
	totalDistance: string | null;
}

const ratioLeaderboard = computed<ElevationRatioEntry[]>(() => {
	return props.leaderboard
		.map((entry) => {
			const distance = Number(entry.totalDistance) || 0;
			const elevation = Number(entry.totalElevation) || 0;
			const ratio = distance > 0 ? (elevation / distance) * 1000 : 0;

			return {
				userId: entry.userId,
				firstname: entry.firstname,
				lastname: entry.lastname,
				avatarUrl: entry.avatarUrl,
				ratio,
				totalElevation: entry.totalElevation,
				totalDistance: entry.totalDistance,
			};
		})
		.filter((entry) => entry.ratio > 0)
		.sort((a, b) => b.ratio - a.ratio);
});

function formatDistance(meters: string | null): string {
	if (!meters) return "0 km";
	return `${(Number(meters) / 1000).toFixed(1)} km`;
}
</script>

<template>
	<div class="overflow-x-auto rounded-lg border border-dark-border bg-dark-card">
		<div class="px-4 py-3 sm:px-6">
			<h3 class="text-sm font-medium text-offwhite">Classement D+ / km</h3>
		</div>
		<table class="min-w-full divide-y divide-dark-border">
			<thead class="bg-dark-elevated">
				<tr>
					<th class="px-2 py-3 text-left text-xs font-medium uppercase text-concrete sm:px-4">#</th>
					<th class="px-2 py-3 text-left text-xs font-medium uppercase text-concrete sm:px-4">Athlète</th>
					<th class="px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4">D+ / km</th>
					<th class="hidden px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4 lg:table-cell">D+ total</th>
					<th class="hidden px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4 lg:table-cell">Distance</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-dark-border">
				<tr v-for="(entry, index) in ratioLeaderboard" :key="entry.userId" class="hover:bg-dark-elevated/50">
					<td class="px-2 py-3 text-sm font-bold sm:px-4">
						<span
							:class="{
								'text-neon': index === 0,
								'text-concrete': index === 1,
								'text-punch': index === 2,
								'text-offwhite': index > 2,
							}"
						>
							{{ index + 1 }}
						</span>
					</td>
					<td class="px-2 py-3 sm:px-4">
						<div class="flex items-center gap-3">
							<img
								v-if="entry.avatarUrl"
								:src="entry.avatarUrl"
								:alt="entry.firstname ?? ''"
								class="h-8 w-8 rounded-full ring-2 ring-dark-border"
							/>
							<div
								v-else
								class="flex h-8 w-8 items-center justify-center rounded-full bg-dark-elevated text-xs font-medium text-concrete"
							>
								{{ (entry.firstname?.[0] ?? '') + (entry.lastname?.[0] ?? '') }}
							</div>
							<span class="text-sm font-medium text-offwhite">
								{{ entry.firstname }} {{ entry.lastname }}
							</span>
						</div>
					</td>
					<td class="px-2 py-3 text-right text-sm font-semibold text-punch sm:px-4">
						{{ entry.ratio.toFixed(1) }} m/km
					</td>
					<td class="hidden px-2 py-3 text-right text-sm text-offwhite sm:px-4 lg:table-cell">
						{{ entry.totalElevation ? `${Math.round(Number(entry.totalElevation))} m` : '0 m' }}
					</td>
					<td class="hidden px-2 py-3 text-right text-sm text-offwhite sm:px-4 lg:table-cell">
						{{ formatDistance(entry.totalDistance) }}
					</td>
				</tr>
				<tr v-if="ratioLeaderboard.length === 0">
					<td colspan="5" class="px-4 py-8 text-center text-sm text-concrete">
						Aucun participant pour le moment.
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
