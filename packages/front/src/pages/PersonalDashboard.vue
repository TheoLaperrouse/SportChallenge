<script setup lang="ts">
import { ref, watch } from "vue";
import ActivityStreak from "../components/ActivityStreak.vue";
import ActivityTable from "../components/ActivityTable.vue";
import ActivityTypeFilter from "../components/ActivityTypeFilter.vue";
import PersonalRecords from "../components/PersonalRecords.vue";
import StatsCards from "../components/StatsCards.vue";
import ActivityChart from "../components/charts/ActivityChart.vue";
import ActivityHeatmap from "../components/charts/ActivityHeatmap.vue";
import DistanceChart from "../components/charts/DistanceChart.vue";
import SpeedChart from "../components/charts/SpeedChart.vue";
import WeekdayChart from "../components/charts/WeekdayChart.vue";
import { useApi } from "../composables/useApi.js";
import type { Activity, ActivityType, PersonalStats } from "../types/index.js";

const { get } = useApi();

const selectedType = ref<ActivityType>("Run");
const activities = ref<Activity[]>([]);
const stats = ref<PersonalStats | null>(null);
const loading = ref(false);

async function loadData() {
	loading.value = true;
	try {
		const [activitiesData, statsData] = await Promise.all([
			get<Activity[]>(`/activities?type=${selectedType.value}`),
			get<PersonalStats>(`/dashboard/personal?type=${selectedType.value}`),
		]);
		activities.value = activitiesData;
		stats.value = statsData;
	} finally {
		loading.value = false;
	}
}

watch(selectedType, () => loadData(), { immediate: true });
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
			<h1 class="text-2xl font-bold text-offwhite">Mon Dashboard</h1>
			<ActivityTypeFilter v-model="selectedType" />
		</div>

		<StatsCards :stats="stats" />

		<PersonalRecords :activities="activities" />

		<div class="grid gap-6 lg:grid-cols-2">
			<DistanceChart :activities="activities" />
			<ActivityChart :activities="activities" />
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<ActivityHeatmap :activities="activities" />
			<WeekdayChart :activities="activities" />
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<ActivityStreak :activities="activities" />
			<SpeedChart :activities="activities" />
		</div>

		<ActivityTable :activities="activities" />
	</div>
</template>
