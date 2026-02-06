<script setup lang="ts">
import type { LeaderboardEntry } from "../types/index.js";

defineProps<{
	leaderboard: LeaderboardEntry[];
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
</script>

<template>
	<div class="overflow-x-auto rounded-lg border border-dark-border bg-dark-card">
		<table class="min-w-full divide-y divide-dark-border">
			<thead class="bg-dark-elevated">
				<tr>
					<th class="px-4 py-3 text-left text-xs font-medium uppercase text-concrete">#</th>
					<th class="px-4 py-3 text-left text-xs font-medium uppercase text-concrete">Athlète</th>
					<th class="px-4 py-3 text-right text-xs font-medium uppercase text-concrete">Activités</th>
					<th class="px-4 py-3 text-right text-xs font-medium uppercase text-concrete">Distance</th>
					<th class="px-4 py-3 text-right text-xs font-medium uppercase text-concrete">Temps</th>
					<th class="px-4 py-3 text-right text-xs font-medium uppercase text-concrete">D+</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-dark-border">
				<tr v-for="(entry, index) in leaderboard" :key="entry.userId" class="hover:bg-dark-elevated/50">
					<td class="px-4 py-3 text-sm font-bold">
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
					<td class="px-4 py-3">
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
					<td class="px-4 py-3 text-right text-sm text-concrete">
						{{ entry.totalActivities }}
					</td>
					<td class="px-4 py-3 text-right text-sm font-semibold text-punch">
						{{ formatDistance(entry.totalDistance) }}
					</td>
					<td class="px-4 py-3 text-right text-sm text-offwhite">
						{{ formatDuration(entry.totalMovingTime) }}
					</td>
					<td class="px-4 py-3 text-right text-sm text-offwhite">
						{{ entry.totalElevation ? `${Math.round(Number(entry.totalElevation))} m` : '0 m' }}
					</td>
				</tr>
				<tr v-if="leaderboard.length === 0">
					<td colspan="6" class="px-4 py-8 text-center text-sm text-concrete">
						Aucun participant pour le moment.
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
