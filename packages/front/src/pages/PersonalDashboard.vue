<script setup lang="ts">
import { ref, watch } from "vue";
import ActivityTable from "../components/ActivityTable.vue";
import ActivityTypeFilter from "../components/ActivityTypeFilter.vue";
import StatsCards from "../components/StatsCards.vue";
import ActivityChart from "../components/charts/ActivityChart.vue";
import DistanceChart from "../components/charts/DistanceChart.vue";
import { useApi } from "../composables/useApi.js";
import type { Activity, ActivityType, PersonalStats } from "../types/index.js";

const { get, post } = useApi();

const selectedType = ref<ActivityType>("Run");
const activities = ref<Activity[]>([]);
const stats = ref<PersonalStats | null>(null);
const syncing = ref(false);
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

async function sync() {
	syncing.value = true;
	try {
		await post("/activities/sync");
		await loadData();
	} finally {
		syncing.value = false;
	}
}

watch(selectedType, () => loadData(), { immediate: true });
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-2xl font-bold text-offwhite">Mon Dashboard</h1>
			<div class="flex items-center gap-4">
				<ActivityTypeFilter v-model="selectedType" />
				<button
					@click="sync"
					:disabled="syncing"
					class="rounded-lg bg-neon px-4 py-2 text-sm font-medium text-dark hover:bg-neon-light disabled:opacity-50"
				>
					{{ syncing ? 'Synchronisation...' : 'Synchroniser' }}
				</button>
			</div>
		</div>

		<StatsCards :stats="stats" />

		<div class="grid gap-6 lg:grid-cols-2">
			<DistanceChart :activities="activities" />
			<ActivityChart :activities="activities" />
		</div>

		<ActivityTable :activities="activities" />
	</div>
</template>
