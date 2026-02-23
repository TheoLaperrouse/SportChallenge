<script setup lang="ts">
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { computed } from "vue";
import { Line } from "vue-chartjs";
import type { Activity } from "../../types/index.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps<{
	activities: Activity[];
}>();

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
	const weekly: Record<string, { totalSpeed: number; count: number }> = {};

	for (const a of props.activities) {
		if (!a.startDate || !a.averageSpeed) continue;
		const key = getWeekMonday(new Date(a.startDate));
		if (!weekly[key]) weekly[key] = { totalSpeed: 0, count: 0 };
		weekly[key].totalSpeed += a.averageSpeed;
		weekly[key].count += 1;
	}

	const sortedKeys = Object.keys(weekly).sort();

	return {
		labels: sortedKeys.map(formatWeekLabel),
		datasets: [
			{
				label: "Vitesse moyenne (km/h)",
				data: sortedKeys.map((k) => {
					const avg = weekly[k].totalSpeed / weekly[k].count;
					return Math.round(avg * 3.6 * 10) / 10;
				}),
				borderColor: PUNCH,
				backgroundColor: PUNCH,
				tension: 0.4,
				pointRadius: 3,
				pointBackgroundColor: PUNCH,
			},
		],
	};
});

const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: { display: false },
		title: { display: true, text: "Vitesse moyenne par semaine", color: OFFWHITE },
	},
	scales: {
		y: {
			beginAtZero: false,
			title: { display: true, text: "km/h", color: CONCRETE },
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
			<Line v-if="activities.length > 0" :data="chartData" :options="chartOptions" />
			<p v-else class="flex h-full items-center justify-center text-sm text-concrete">
				Aucune donnée
			</p>
		</div>
	</div>
</template>
