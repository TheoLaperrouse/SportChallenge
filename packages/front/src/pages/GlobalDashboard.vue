<script setup lang="ts">
import { ref, watch } from "vue";
import ActivityTypeFilter from "../components/ActivityTypeFilter.vue";
import LeaderboardTable from "../components/LeaderboardTable.vue";
import CumulativeDistanceChart from "../components/charts/CumulativeDistanceChart.vue";
import { useApi } from "../composables/useApi.js";
import type {
	ActivityType,
	AthleteTimeseries,
	GlobalDashboardResponse,
	GlobalStats,
	LeaderboardEntry,
} from "../types/index.js";

const { get } = useApi();

const selectedType = ref<ActivityType>("Run");
const leaderboard = ref<LeaderboardEntry[]>([]);
const globalStats = ref<GlobalStats | null>(null);
const timeseriesData = ref<AthleteTimeseries[]>([]);
const loading = ref(false);

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

async function loadData() {
	loading.value = true;
	try {
		const [globalData, timeseries] = await Promise.all([
			get<GlobalDashboardResponse>(`/dashboard/global?type=${selectedType.value}`),
			get<AthleteTimeseries[]>(`/dashboard/timeseries?type=${selectedType.value}`),
		]);
		leaderboard.value = globalData.leaderboard;
		globalStats.value = globalData.stats;
		timeseriesData.value = timeseries;
	} finally {
		loading.value = false;
	}
}

watch(selectedType, () => loadData(), { immediate: true });
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-2xl font-bold text-gray-900">Classement Général</h1>
			<ActivityTypeFilter v-model="selectedType" />
		</div>

		<div v-if="globalStats" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<div class="rounded-lg bg-white p-6 shadow">
				<p class="text-sm text-gray-500">Participants</p>
				<p class="mt-1 text-2xl font-bold text-gray-900">{{ globalStats.totalParticipants }}</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow">
				<p class="text-sm text-gray-500">Activités totales</p>
				<p class="mt-1 text-2xl font-bold text-gray-900">{{ globalStats.totalActivities }}</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow">
				<p class="text-sm text-gray-500">Distance totale</p>
				<p class="mt-1 text-2xl font-bold text-gray-900">{{ formatDistance(globalStats.totalDistance) }}</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow">
				<p class="text-sm text-gray-500">Temps total</p>
				<p class="mt-1 text-2xl font-bold text-gray-900">{{ formatDuration(globalStats.totalMovingTime) }}</p>
			</div>
		</div>

		<CumulativeDistanceChart :data="timeseriesData" />

		<LeaderboardTable :leaderboard="leaderboard" />
	</div>
</template>
