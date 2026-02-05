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
import type { AthleteTimeseries } from "../../types/index.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps<{
	data: AthleteTimeseries[];
}>();

const COLORS = [
	"rgb(234, 88, 12)",
	"rgb(59, 130, 246)",
	"rgb(34, 197, 94)",
	"rgb(168, 85, 247)",
	"rgb(236, 72, 153)",
	"rgb(14, 165, 233)",
	"rgb(245, 158, 11)",
	"rgb(6, 182, 212)",
];

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getAthleteName(athlete: AthleteTimeseries): string {
	if (athlete.firstname && athlete.lastname) {
		return `${athlete.firstname} ${athlete.lastname}`;
	}
	return athlete.username ?? `User ${athlete.userId}`;
}

const chartData = computed(() => {
	// Collect all unique dates and sort them
	const allDates = new Set<string>();
	for (const athlete of props.data) {
		for (const point of athlete.data) {
			allDates.add(point.date);
		}
	}
	const sortedDates = Array.from(allDates).sort();

	// Build datasets for each athlete
	const datasets = props.data.map((athlete, index) => {
		const color = COLORS[index % COLORS.length];
		const dataMap = new Map(athlete.data.map((p) => [p.date, p.cumulativeDistance]));

		// Fill in gaps: carry forward the last known cumulative value
		let lastValue = 0;
		const values = sortedDates.map((date) => {
			const value = dataMap.get(date);
			if (value !== undefined) {
				lastValue = value;
			}
			return Math.round((lastValue / 1000) * 10) / 10; // Convert to km with 1 decimal
		});

		return {
			label: getAthleteName(athlete),
			data: values,
			borderColor: color,
			backgroundColor: color,
			tension: 0.1,
			pointRadius: 2,
		};
	});

	return {
		labels: sortedDates.map(formatDate),
		datasets,
	};
});

const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: { display: true, position: "bottom" as const },
		title: { display: true, text: "Distance cumulée par athlète" },
	},
	scales: {
		y: { beginAtZero: true, title: { display: true, text: "km" } },
		x: { title: { display: true, text: "Date" } },
	},
};
</script>

<template>
	<div class="rounded-lg bg-white p-6 shadow">
		<div class="h-80">
			<Line v-if="data.length > 0" :data="chartData" :options="chartOptions" />
			<p v-else class="flex h-full items-center justify-center text-sm text-gray-400">
				Aucune donnée
			</p>
		</div>
	</div>
</template>
