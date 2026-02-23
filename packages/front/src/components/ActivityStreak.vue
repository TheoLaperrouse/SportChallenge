<script setup lang="ts">
import { computed } from "vue";
import type { Activity } from "../types/index.js";

const props = defineProps<{
	activities: Activity[];
}>();

const streakData = computed(() => {
	if (props.activities.length === 0) {
		return { current: 0, best: 0 };
	}

	// Get unique activity dates sorted ascending
	const activityDates = new Set<string>();
	for (const a of props.activities) {
		if (a.startDate) {
			activityDates.add(new Date(a.startDate).toISOString().split("T")[0]);
		}
	}
	const sortedDates = Array.from(activityDates).sort();
	if (sortedDates.length === 0) return { current: 0, best: 0 };

	// Count consecutive days
	const streaks: number[] = [];
	let consecutiveDays = 1;

	for (let i = 1; i < sortedDates.length; i++) {
		const prev = new Date(sortedDates[i - 1]);
		const curr = new Date(sortedDates[i]);
		const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 1) {
			consecutiveDays++;
		} else {
			streaks.push(consecutiveDays);
			consecutiveDays = 1;
		}
	}
	streaks.push(consecutiveDays);

	const best = Math.max(...streaks);

	// Current streak is active if last activity was today or yesterday
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const lastActivityDate = new Date(sortedDates[sortedDates.length - 1]);
	const daysSinceLast = Math.round(
		(today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	const lastStreak = streaks[streaks.length - 1];
	const current = daysSinceLast <= 1 ? lastStreak : 0;

	// Total active days
	const activeDays = sortedDates.length;

	// Average activities per week over the full period
	const firstDate = new Date(sortedDates[0]);
	const lastDate = new Date(sortedDates[sortedDates.length - 1]);
	const totalWeeks = Math.max(
		1,
		Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)),
	);
	const avgPerWeek = Math.round((props.activities.length / totalWeeks) * 10) / 10;

	return { current, best, activeDays, avgPerWeek };
});
</script>

<template>
	<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
		<h3 class="mb-4 text-sm font-medium text-offwhite">Régularité</h3>
		<div class="grid gap-3 grid-cols-2">
			<div class="rounded-lg border border-dark-border bg-dark-elevated p-4 text-center">
				<p class="text-xs text-concrete">Série actuelle</p>
				<p class="mt-2 text-3xl font-bold text-punch">
					{{ streakData.current }}
				</p>
				<p class="mt-1 text-xs text-concrete">
					{{ streakData.current > 1 ? "jours consécutifs" : "jour consécutif" }}
				</p>
			</div>
			<div class="rounded-lg border border-dark-border bg-dark-elevated p-4 text-center">
				<p class="text-xs text-concrete">Meilleure série</p>
				<p class="mt-2 text-3xl font-bold text-neon">
					{{ streakData.best }}
				</p>
				<p class="mt-1 text-xs text-concrete">
					{{ streakData.best > 1 ? "jours consécutifs" : "jour consécutif" }}
				</p>
			</div>
			<div class="rounded-lg border border-dark-border bg-dark-elevated p-4 text-center">
				<p class="text-xs text-concrete">Jours actifs</p>
				<p class="mt-2 text-3xl font-bold text-punch">
					{{ streakData.activeDays }}
				</p>
				<p class="mt-1 text-xs text-concrete">jours avec activité</p>
			</div>
			<div class="rounded-lg border border-dark-border bg-dark-elevated p-4 text-center">
				<p class="text-xs text-concrete">Moy. / semaine</p>
				<p class="mt-2 text-3xl font-bold text-neon">
					{{ streakData.avgPerWeek }}
				</p>
				<p class="mt-1 text-xs text-concrete">activités en moyenne</p>
			</div>
		</div>
	</div>
</template>
