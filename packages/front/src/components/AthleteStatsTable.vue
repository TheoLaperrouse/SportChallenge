<script setup lang="ts">
import { computed } from "vue";
import type { AthleteDetailedStats } from "../types/index.js";

const props = defineProps<{
	athletes: AthleteDetailedStats[];
}>();

interface Row {
	userId: number;
	firstname: string | null;
	lastname: string | null;
	avatarUrl: string | null;
	maxDistance: string;
	avgSpeed: string;
	avgDistancePerActivity: string;
	activeWeeks: number;
}

const rows = computed<Row[]>(() =>
	props.athletes.map((a) => ({
		userId: a.userId,
		firstname: a.firstname,
		lastname: a.lastname,
		avatarUrl: a.avatarUrl,
		maxDistance: a.maxDistance ? `${(a.maxDistance / 1000).toFixed(1)} km` : "—",
		avgSpeed:
			a.avgSpeed && Number(a.avgSpeed) > 0
				? `${(Number(a.avgSpeed) * 3.6).toFixed(1)} km/h`
				: "—",
		avgDistancePerActivity: a.avgDistancePerActivity
			? `${(Number(a.avgDistancePerActivity) / 1000).toFixed(1)} km`
			: "—",
		activeWeeks: a.activeWeeks,
	})),
);
</script>

<template>
	<div class="overflow-x-auto rounded-lg border border-dark-border bg-dark-card">
		<div class="px-4 py-3 sm:px-6">
			<h3 class="text-sm font-medium text-offwhite">Profil des athlètes</h3>
		</div>
		<table class="min-w-full divide-y divide-dark-border">
			<thead class="bg-dark-elevated">
				<tr>
					<th class="px-2 py-3 text-left text-xs font-medium uppercase text-concrete sm:px-4">Athlète</th>
					<th class="px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4">Sortie max</th>
					<th class="px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4">Vit. moy.</th>
					<th class="hidden px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4 md:table-cell">km / sortie</th>
					<th class="hidden px-2 py-3 text-right text-xs font-medium uppercase text-concrete sm:px-4 lg:table-cell">Semaines actives</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-dark-border">
				<tr v-for="row in rows" :key="row.userId" class="hover:bg-dark-elevated/50">
					<td class="px-2 py-3 sm:px-4">
						<div class="flex items-center gap-3">
							<img
								v-if="row.avatarUrl"
								:src="row.avatarUrl"
								:alt="row.firstname ?? ''"
								class="h-8 w-8 rounded-full ring-2 ring-dark-border"
							/>
							<div
								v-else
								class="flex h-8 w-8 items-center justify-center rounded-full bg-dark-elevated text-xs font-medium text-concrete"
							>
								{{ (row.firstname?.[0] ?? "") + (row.lastname?.[0] ?? "") }}
							</div>
							<span class="text-sm font-medium text-offwhite">
								{{ row.firstname }} {{ row.lastname }}
							</span>
						</div>
					</td>
					<td class="px-2 py-3 text-right text-sm font-semibold text-punch sm:px-4">
						{{ row.maxDistance }}
					</td>
					<td class="px-2 py-3 text-right text-sm text-offwhite sm:px-4">
						{{ row.avgSpeed }}
					</td>
					<td class="hidden px-2 py-3 text-right text-sm text-offwhite sm:px-4 md:table-cell">
						{{ row.avgDistancePerActivity }}
					</td>
					<td class="hidden px-2 py-3 text-right text-sm text-offwhite sm:px-4 lg:table-cell">
						{{ row.activeWeeks }}
					</td>
				</tr>
				<tr v-if="rows.length === 0">
					<td colspan="5" class="px-4 py-8 text-center text-sm text-concrete">
						Aucun participant pour le moment.
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
