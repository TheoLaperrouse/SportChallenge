<script setup lang="ts">
import type { RecentActivity } from "../types/index.js";

defineProps<{
	activities: RecentActivity[];
}>();

function formatDistance(meters: number | null): string {
	if (!meters) return "0 km";
	return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number | null): string {
	if (!seconds) return "0h";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${h}h ${m}m`;
}

function formatDate(dateStr: string | null): string {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	return date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getActivityIcon(type: string | null): string {
	switch (type) {
		case "Run":
		case "TrailRun":
			return "run";
		case "Ride":
		case "MountainBikeRide":
		case "GravelRide":
		case "EBikeRide":
		case "VirtualRide":
			return "bike";
		case "Swim":
			return "swim";
		default:
			return "activity";
	}
}
</script>

<template>
	<div class="min-w-0 rounded-lg border border-dark-border bg-dark-card">
		<div class="border-b border-dark-border px-4 py-4 sm:px-6">
			<h2 class="text-lg font-semibold text-offwhite">Activités récentes</h2>
		</div>
		<ul class="divide-y divide-dark-border">
			<li
				v-for="activity in activities"
				:key="activity.id"
				class="flex items-center gap-3 px-4 py-3 hover:bg-dark-elevated/50 sm:gap-4 sm:px-6 sm:py-4"
			>
				<!-- Activity icon -->
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-punch/20 text-punch">
					<svg v-if="getActivityIcon(activity.type) === 'run'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					<svg v-else-if="getActivityIcon(activity.type) === 'bike'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<circle cx="5.5" cy="17.5" r="3.5" />
						<circle cx="18.5" cy="17.5" r="3.5" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3" />
					</svg>
					<svg v-else-if="getActivityIcon(activity.type) === 'swim'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 15c2.483 0 4.345-1 6-3 1.655 2 3.517 3 6 3s4.345-1 6-3M3 19c2.483 0 4.345-1 6-3 1.655 2 3.517 3 6 3s4.345-1 6-3" />
					</svg>
					<svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>

				<!-- Activity info -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<img
							v-if="activity.avatarUrl"
							:src="activity.avatarUrl"
							:alt="activity.firstname ?? ''"
							class="h-6 w-6 rounded-full ring-1 ring-dark-border"
						/>
						<div
							v-else
							class="flex h-6 w-6 items-center justify-center rounded-full bg-dark-elevated text-xs font-medium text-concrete"
						>
							{{ (activity.firstname?.[0] ?? '') + (activity.lastname?.[0] ?? '') }}
						</div>
						<span class="text-sm font-medium text-offwhite">
							{{ activity.firstname }} {{ activity.lastname }}
						</span>
					</div>
					<p class="mt-0.5 truncate text-sm text-concrete">{{ activity.name }}</p>
				</div>

				<!-- Stats -->
				<div class="hidden text-right text-sm sm:block">
					<p class="font-semibold text-punch">{{ formatDistance(activity.distance) }}</p>
					<p class="text-concrete">{{ formatDuration(activity.movingTime) }}</p>
				</div>

				<!-- Date -->
				<div class="shrink-0 text-right text-xs text-concrete">
					{{ formatDate(activity.startDate) }}
				</div>
			</li>
			<li v-if="activities.length === 0" class="px-6 py-8 text-center text-sm text-concrete">
				Aucune activité récente.
			</li>
		</ul>
	</div>
</template>
