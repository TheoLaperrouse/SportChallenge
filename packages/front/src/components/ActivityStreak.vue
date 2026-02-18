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

	// Count consecutive days then divide by 3
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

	// Convert consecutive days into periods of 3
	const bestConsecutive = Math.max(...streaks);
	const best = Math.floor(bestConsecutive / 3);

	// Check current streak (last streak, ending within last 2 days)
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const lastActivityDate = new Date(sortedDates[sortedDates.length - 1]);
	const daysSinceLast = Math.round(
		(today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	const lastStreak = streaks[streaks.length - 1];
	const current = daysSinceLast <= 2 ? Math.floor(lastStreak / 3) : 0;

	return { current, best };
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
					{{ streakData.current > 1 ? "périodes" : "période" }} de 3 jours
				</p>
			</div>
			<div class="rounded-lg border border-dark-border bg-dark-elevated p-4 text-center">
				<p class="text-xs text-concrete">Meilleure série</p>
				<p class="mt-2 text-3xl font-bold text-neon">
					{{ streakData.best }}
				</p>
				<p class="mt-1 text-xs text-concrete">
					{{ streakData.best > 1 ? "périodes" : "période" }} de 3 jours
				</p>
			</div>
		</div>
	</div>
</template>
