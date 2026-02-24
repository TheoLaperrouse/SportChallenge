<script setup lang="ts">
import {
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	TimeScale,
	Title,
	Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { computed } from "vue";
import { Line } from "vue-chartjs";
import type { AthleteElevationTimeseries } from "../../types/index.js";
import { getAthleteColor } from "../../utils/athleteColors.js";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps<{
	data: AthleteElevationTimeseries[];
}>();

const CONCRETE = "#8E8E8E";
const OFFWHITE = "#F5F5F5";

function getAthleteName(athlete: AthleteElevationTimeseries): string {
	if (athlete.firstname && athlete.lastname) {
		return `${athlete.firstname} ${athlete.lastname}`;
	}
	return athlete.username ?? `User ${athlete.userId}`;
}

const chartData = computed(() => {
	const allDates = new Set<string>();
	for (const athlete of props.data) {
		for (const point of athlete.data) {
			allDates.add(point.date);
		}
	}
	const sortedDates = Array.from(allDates).sort();

	const datasets = props.data.map((athlete) => {
		const color = getAthleteColor(athlete.userId);
		const dataMap = new Map(athlete.data.map((p) => [p.date, p.cumulativeElevation]));

		let lastValue = 0;
		const values = sortedDates.map((date) => {
			const value = dataMap.get(date);
			if (value !== undefined) {
				lastValue = value;
			}
			return {
				x: date,
				y: Math.round(lastValue),
			};
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

	// eslint-disable-next-line -- Chart.js time scale accepts string dates at runtime
	return { datasets } as never;
});

const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: { display: true, position: "bottom" as const, labels: { color: OFFWHITE } },
		title: { display: true, text: "Dénivelé cumulé par athlète", color: OFFWHITE },
	},
	scales: {
		y: {
			beginAtZero: true,
			title: { display: true, text: "m", color: CONCRETE },
			ticks: { color: CONCRETE },
			grid: { color: "rgba(142, 142, 142, 0.2)" },
		},
		x: {
			type: "time" as const,
			time: {
				unit: "day" as const,
				displayFormats: {
					day: "dd/MM",
				},
				tooltipFormat: "dd/MM/yyyy",
			},
			title: { display: true, text: "Date", color: CONCRETE },
			ticks: { color: CONCRETE, maxTicksLimit: 15 },
			grid: { color: "rgba(142, 142, 142, 0.2)" },
		},
	},
};
</script>

<template>
	<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
		<div class="h-56 sm:h-80">
			<Line v-if="data.length > 0" :data="chartData" :options="chartOptions" />
			<p v-else class="flex h-full items-center justify-center text-sm text-concrete">
				Aucune donnée
			</p>
		</div>
	</div>
</template>
