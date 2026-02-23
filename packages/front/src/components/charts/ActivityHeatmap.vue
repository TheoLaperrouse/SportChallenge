<script setup lang="ts">
import { computed } from "vue";
import type { Activity } from "../../types/index.js";

const props = defineProps<{
	activities: Activity[];
}>();

const DAY_LABELS = ["Lun", "", "Mer", "", "Ven", "", ""];

interface HeatmapDay {
	date: string;
	count: number;
	inRange: boolean;
}

const heatmapData = computed(() => {
	// todayMidnight = minuit du jour courant (pour les comparaisons du calendrier)
	const todayMidnight = new Date();
	todayMidnight.setHours(0, 0, 0, 0);

	// endOfToday = fin du jour courant (pour inclure toutes les activités du jour)
	const endOfToday = new Date();
	endOfToday.setHours(23, 59, 59, 999);

	const startDate = new Date(todayMidnight);
	startDate.setMonth(startDate.getMonth() - 4);

	const dailyCounts = new Map<string, number>();
	for (const a of props.activities) {
		if (!a.startDate) continue;
		const date = new Date(a.startDate);
		if (date >= startDate && date <= endOfToday) {
			const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
			dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
		}
	}

	// Start on the Monday of the start week
	const cursor = new Date(startDate);
	const dayOfWeek = cursor.getDay();
	cursor.setDate(cursor.getDate() - ((dayOfWeek + 6) % 7)); // Back to Monday

	const weeks: HeatmapDay[][] = [];

	while (cursor <= todayMidnight) {
		const week: HeatmapDay[] = [];
		for (let i = 0; i < 7; i++) {
			const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
			week.push({
				date: key,
				count: dailyCounts.get(key) ?? 0,
				inRange: cursor >= startDate && cursor <= todayMidnight,
			});
			cursor.setDate(cursor.getDate() + 1);
		}
		weeks.push(week);
	}

	return weeks;
});

function getCellColor(day: HeatmapDay): string {
	if (!day.inRange) return "bg-transparent";
	if (day.count === 0) return "bg-dark-elevated";
	if (day.count === 1) return "bg-punch/30";
	if (day.count === 2) return "bg-punch/50";
	if (day.count === 3) return "bg-punch/70";
	return "bg-punch";
}

function formatTooltip(day: HeatmapDay): string {
	// Parse YYYY-MM-DD as local date to avoid UTC offset shifting the day
	const [year, month, d] = day.date.split("-").map(Number);
	const date = new Date(year, month - 1, d);
	const formatted = date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
	if (day.count === 0) return `${formatted} : aucune activité`;
	return `${formatted} : ${day.count} activité${day.count > 1 ? "s" : ""}`;
}

const monthLabels = computed(() => {
	const labels: { label: string; col: number }[] = [];
	let lastMonth = -1;

	for (let i = 0; i < heatmapData.value.length; i++) {
		const firstDay = heatmapData.value[i].find((d) => d.inRange);
		if (!firstDay) continue;
		const date = new Date(firstDay.date);
		const month = date.getMonth();
		if (month !== lastMonth) {
			lastMonth = month;
			labels.push({
				label: date.toLocaleDateString("fr-FR", { month: "short" }),
				col: i,
			});
		}
	}

	return labels;
});
</script>

<template>
	<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
		<h3 class="mb-4 text-sm font-medium text-offwhite">Activité des 4 derniers mois</h3>
		<div class="overflow-x-auto">
			<div class="inline-flex flex-col gap-1">
				<!-- Month labels -->
				<div class="flex gap-[3px] pl-8 text-xs text-concrete">
					<template v-for="(_, weekIdx) in heatmapData" :key="'m' + weekIdx">
						<div class="h-3 w-3">
							<span
								v-if="monthLabels.find((m) => m.col === weekIdx)"
								class="whitespace-nowrap"
							>
								{{ monthLabels.find((m) => m.col === weekIdx)?.label }}
							</span>
						</div>
					</template>
				</div>
				<!-- Grid -->
				<div class="flex gap-1">
					<!-- Day labels -->
					<div class="flex flex-col gap-[3px] pr-1 text-xs text-concrete">
						<div v-for="(label, i) in DAY_LABELS" :key="i" class="flex h-3 w-5 items-center">
							{{ label }}
						</div>
					</div>
					<!-- Weeks -->
					<div class="flex gap-[3px]">
						<div v-for="(week, weekIdx) in heatmapData" :key="weekIdx" class="flex flex-col gap-[3px]">
							<div
								v-for="(day, dayIdx) in week"
								:key="dayIdx"
								:class="getCellColor(day)"
								:title="day.inRange ? formatTooltip(day) : ''"
								class="h-3 w-3 rounded-sm"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Legend -->
		<div class="mt-4 flex items-center justify-end gap-2 text-xs text-concrete">
			<span>Moins</span>
			<div class="flex gap-1">
				<div class="h-3 w-3 rounded-sm bg-dark-elevated" />
				<div class="h-3 w-3 rounded-sm bg-punch/30" />
				<div class="h-3 w-3 rounded-sm bg-punch/50" />
				<div class="h-3 w-3 rounded-sm bg-punch/70" />
				<div class="h-3 w-3 rounded-sm bg-punch" />
			</div>
			<span>Plus</span>
		</div>
	</div>
</template>
