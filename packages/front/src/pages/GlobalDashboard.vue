<script setup lang="ts">
import { ref, watch } from "vue";
import ActivityTypeFilter from "../components/ActivityTypeFilter.vue";
import ElevationRatioTable from "../components/ElevationRatioTable.vue";
import LeaderboardTable from "../components/LeaderboardTable.vue";
import RecentActivitiesList from "../components/RecentActivitiesList.vue";
import CumulativeDistanceChart from "../components/charts/CumulativeDistanceChart.vue";
import CumulativeElevationChart from "../components/charts/CumulativeElevationChart.vue";
import { useApi } from "../composables/useApi.js";
import type {
	ActivityType,
	AthleteElevationTimeseries,
	AthleteTimeseries,
	GlobalDashboardResponse,
	GlobalStats,
	LeaderboardEntry,
	RecentActivity,
} from "../types/index.js";

const { get } = useApi();

const selectedType = ref<ActivityType>("Run");
const leaderboard = ref<LeaderboardEntry[]>([]);
const globalStats = ref<GlobalStats | null>(null);
const timeseriesData = ref<AthleteTimeseries[]>([]);
const elevationTimeseriesData = ref<AthleteElevationTimeseries[]>([]);
const recentActivities = ref<RecentActivity[]>([]);
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
		const [globalData, timeseries, elevationTimeseries, recent] = await Promise.all([
			get<GlobalDashboardResponse>(`/dashboard/global?type=${selectedType.value}`),
			get<AthleteTimeseries[]>(`/dashboard/timeseries?type=${selectedType.value}`),
			get<AthleteElevationTimeseries[]>(
				`/dashboard/elevation-timeseries?type=${selectedType.value}`,
			),
			get<RecentActivity[]>(`/dashboard/recent?type=${selectedType.value}`),
		]);
		leaderboard.value = globalData.leaderboard;
		globalStats.value = globalData.stats;
		timeseriesData.value = timeseries;
		elevationTimeseriesData.value = elevationTimeseries;
		recentActivities.value = recent;
	} finally {
		loading.value = false;
	}
}

watch(selectedType, () => loadData(), { immediate: true });
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
			<h1 class="text-2xl font-bold text-offwhite">Classement Général</h1>
			<ActivityTypeFilter v-model="selectedType" />
		</div>

		<div v-if="globalStats" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
			<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
				<p class="text-sm text-concrete">Participants</p>
				<p class="mt-1 text-xl font-bold text-punch sm:text-2xl">{{ globalStats.totalParticipants }}</p>
			</div>
			<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
				<p class="text-sm text-concrete">Activités totales</p>
				<p class="mt-1 text-xl font-bold text-punch sm:text-2xl">{{ globalStats.totalActivities }}</p>
			</div>
			<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
				<p class="text-sm text-concrete">Distance totale</p>
				<p class="mt-1 text-xl font-bold text-punch sm:text-2xl">{{ formatDistance(globalStats.totalDistance) }}</p>
			</div>
			<div class="rounded-lg border border-dark-border bg-dark-card p-4 sm:p-6">
				<p class="text-sm text-concrete">Temps total</p>
				<p class="mt-1 text-xl font-bold text-punch sm:text-2xl">{{ formatDuration(globalStats.totalMovingTime) }}</p>
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<LeaderboardTable :leaderboard="leaderboard" />
			<RecentActivitiesList :activities="recentActivities" />
		</div>

		<CumulativeDistanceChart :data="timeseriesData" />

		<CumulativeElevationChart :data="elevationTimeseriesData" />

		<ElevationRatioTable :leaderboard="leaderboard" />
	</div>
</template>
