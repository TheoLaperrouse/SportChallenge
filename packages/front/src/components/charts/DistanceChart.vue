<script setup lang="ts">
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from "chart.js";
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import type { Activity } from "../../types/index.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
	activities: Activity[];
}>();

// Colors from palette
const PUNCH = "#FF6A00";
const CONCRETE = "#8E8E8E";
const OFFWHITE = "#F5F5F5";

function getWeekMonday(date: Date): string {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
	return d.toISOString().split("T")[0];
}

function formatWeekLabel(isoDate: string): string {
	const [year, month, day] = isoDate.split("-");
	return `${day}/${month}/${year.slice(2)}`;
}

const chartData = computed(() => {
	const weekly: Record<string, number> = {};

	for (const a of props.activities) {
		if (!a.startDate || !a.distance) continue;
		const key = getWeekMonday(new Date(a.startDate));
		weekly[key] = (weekly[key] ?? 0) + a.distance / 1000;
	}

	const sortedKeys = Object.keys(weekly).sort();

	return {
		labels: sortedKeys.map(formatWeekLabel),
		datasets: [
			{
				label: "Distance (km)",
				data: sortedKeys.map((k) => Math.round(weekly[k] * 10) / 10),
				backgroundColor: PUNCH,
				borderRadius: 4,
			},
		],
	};
});

const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: { display: false },
		title: { display: true, text: "Distance par semaine", color: OFFWHITE },
	},
	scales: {
		y: {
			beginAtZero: true,
			title: { display: true, text: "km", color: CONCRETE },
			ticks: { color: CONCRETE },
			grid: { color: "rgba(142, 142, 142, 0.2)" },
		},
		x: {
			ticks: { color: CONCRETE, maxTicksLimit: 8 },
			grid: { color: "rgba(142, 142, 142, 0.2)" },
		},
	},
};
</script>

<template>
	<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
		<div class="h-48 sm:h-64">
			<Bar v-if="activities.length > 0" :data="chartData" :options="chartOptions" />
			<p v-else class="flex h-full items-center justify-center text-sm text-concrete">
				Aucune donnée
			</p>
		</div>
	</div>
</template>
