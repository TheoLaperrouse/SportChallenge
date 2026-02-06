<script setup lang="ts">
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import polyline from "@mapbox/polyline";
import { onMounted, onUnmounted, ref, watch } from "vue";
import ActivityTypeFilter from "../components/ActivityTypeFilter.vue";
import { useApi } from "../composables/useApi.js";
import type { ActivityType, MapActivity } from "../types/index.js";

const { get } = useApi();

const selectedType = ref<ActivityType>("Run");
const mapActivities = ref<MapActivity[]>([]);
const loading = ref(false);
const mapContainer = ref<HTMLDivElement | null>(null);

let map: L.Map | null = null;
let polylineLayer: L.LayerGroup | null = null;

const TYPE_COLORS: Record<string, string> = {
	Run: "#284b63",
	TrailRun: "#153243",
	Ride: "#b4b8ab",
	MountainBikeRide: "#8a8e82",
	GravelRide: "#9da18f",
	EBikeRide: "#A78BFA",
	VirtualRide: "#60A5FA",
	Swim: "#22D3EE",
};

function getRouteColor(type: string | null): string {
	return TYPE_COLORS[type ?? ""] ?? "#b4b8ab";
}

function formatDistance(meters: number | null): string {
	if (!meters) return "0 km";
	return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number | null): string {
	if (!seconds) return "0h";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${h}h${String(m).padStart(2, "0")}`;
}

function getAthleteName(activity: MapActivity): string {
	if (activity.firstname && activity.lastname) {
		return `${activity.firstname} ${activity.lastname}`;
	}
	return `Athlete ${activity.userId}`;
}

function buildPopupContent(activity: MapActivity): string {
	const date = activity.startDate ? new Date(activity.startDate).toLocaleDateString("fr-FR") : "";
	return `
		<div style="font-family: sans-serif; color: #f4f9e9; padding: 4px; min-width: 200px;">
			<div style="font-weight: bold; color: #284b63; margin-bottom: 4px;">
				${activity.name ?? "Sans nom"}
			</div>
			<div style="font-size: 12px; color: #b4b8ab; margin-bottom: 6px;">
				${getAthleteName(activity)} &middot; ${date}
			</div>
			<div style="font-size: 12px; color: #eef0eb;">
				${formatDistance(activity.distance)} &middot;
				${formatDuration(activity.movingTime)} &middot;
				${activity.totalElevationGain?.toFixed(0) ?? 0}m D+
			</div>
		</div>
	`;
}

function renderRoutes() {
	if (!map || !polylineLayer) return;
	polylineLayer.clearLayers();

	const bounds: L.LatLng[] = [];

	for (const activity of mapActivities.value) {
		if (!activity.summaryPolyline) continue;

		const decoded = polyline.decode(activity.summaryPolyline);
		if (decoded.length === 0) continue;

		const latLngs = decoded.map(([lat, lng]: [number, number]) => L.latLng(lat, lng));
		bounds.push(...latLngs);

		const line = L.polyline(latLngs, {
			color: getRouteColor(activity.type),
			weight: 3,
			opacity: 0.7,
		});

		line.bindPopup(buildPopupContent(activity), {
			className: "dark-popup",
			maxWidth: 300,
		});

		line.on("mouseover", () => {
			line.setStyle({ weight: 5, opacity: 1 });
		});
		line.on("mouseout", () => {
			line.setStyle({ weight: 3, opacity: 0.7 });
		});

		polylineLayer.addLayer(line);
	}

	if (bounds.length > 0) {
		map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] });
	}
}

async function loadData() {
	loading.value = true;
	try {
		mapActivities.value = await get<MapActivity[]>(`/map/activities?type=${selectedType.value}`);
		renderRoutes();
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	if (!mapContainer.value) return;

	map = L.map(mapContainer.value, {
		center: [46.8, 2.3],
		zoom: 6,
		zoomControl: true,
	});

	L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
		maxZoom: 19,
	}).addTo(map);

	polylineLayer = L.layerGroup().addTo(map);

	loadData();
});

onUnmounted(() => {
	map?.remove();
	map = null;
});

watch(selectedType, () => loadData());
</script>

<template>
	<div class="space-y-4">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-2xl font-bold text-ivory">Carte des Activites</h1>
			<ActivityTypeFilter v-model="selectedType" />
		</div>
		<div class="relative overflow-hidden rounded-lg border border-dark-border">
			<div
				v-if="loading"
				class="absolute inset-0 z-[1000] flex items-center justify-center bg-dark/80"
			>
				<p class="text-sm text-ash">Chargement...</p>
			</div>
			<div ref="mapContainer" class="h-[calc(100vh-12rem)] w-full" />
		</div>
		<p class="text-sm text-ash">
			{{ mapActivities.length }} activites affichees
		</p>
	</div>
</template>
