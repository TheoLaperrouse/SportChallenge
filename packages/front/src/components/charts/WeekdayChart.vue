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

const PUNCH = "#FF6A00";
const CONCRETE = "#8E8E8E";
const OFFWHITE = "#F5F5F5";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const chartData = computed(() => {
	// Index 0 = Monday, ..., 6 = Sunday (ISO week)
	const counts = [0, 0, 0, 0, 0, 0, 0];

	for (const a of props.activities) {
		if (!a.startDate) continue;
		const day = new Date(a.startDate).getDay(); // 0=Sun, 1=Mon, ...6=Sat
		const isoIdx = (day + 6) % 7; // convert to Mon=0 ... Sun=6
		counts[isoIdx]++;
	}

	return {
		labels: DAYS,
		datasets: [
			{
				label: "Activités",
				data: counts,
				backgroundColor: counts.map((_, i) => {
					const max = Math.max(...counts);
					return max > 0 && counts[i] === max ? PUNCH : `${PUNCH}66`;
				}),
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
		title: { display: true, text: "Activités par jour de la semaine", color: OFFWHITE },
	},
	scales: {
		y: {
			beginAtZero: true,
			ticks: { stepSize: 1, color: CONCRETE },
			grid: { color: "rgba(142, 142, 142, 0.2)" },
		},
		x: {
			ticks: { color: CONCRETE },
			grid: { display: false },
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
