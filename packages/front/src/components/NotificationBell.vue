<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useApi } from "../composables/useApi.js";
import type { Notification, NotificationsResponse } from "../types/index.js";

const { get, post, patch } = useApi();

const open = ref(false);
const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);

async function fetchNotifications() {
	try {
		const data = await get<NotificationsResponse>("/notifications");
		notifications.value = data.notifications;
		unreadCount.value = data.unreadCount;
	} catch {
		// silently ignore errors (e.g. not authenticated yet)
	}
}

async function markRead(id: number) {
	const n = notifications.value.find((x) => x.id === id);
	if (!n || n.readAt) return;
	n.readAt = new Date().toISOString();
	unreadCount.value = Math.max(0, unreadCount.value - 1);
	await patch(`/notifications/${id}/read`);
}

async function markAllRead() {
	for (const n of notifications.value) {
		n.readAt = n.readAt ?? new Date().toISOString();
	}
	unreadCount.value = 0;
	await post("/notifications/read-all");
}

function toggleOpen() {
	open.value = !open.value;
}

function closeOnOutsideClick(e: MouseEvent) {
	const el = document.getElementById("notification-bell-root");
	if (el && !el.contains(e.target as Node)) {
		open.value = false;
	}
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

onMounted(() => {
	fetchNotifications();
	document.addEventListener("click", closeOnOutsideClick);
});

onUnmounted(() => {
	document.removeEventListener("click", closeOnOutsideClick);
});
</script>

<template>
	<div id="notification-bell-root" class="relative">
		<!-- Bell button -->
		<button
			@click="toggleOpen"
			class="relative flex items-center justify-center rounded p-2 text-offwhite hover:bg-dark-elevated"
			aria-label="Notifications"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
				/>
			</svg>
			<span
				v-if="unreadCount > 0"
				class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-punch text-[10px] font-bold text-white"
			>
				{{ unreadCount > 9 ? "9+" : unreadCount }}
			</span>
		</button>

		<!-- Dropdown panel -->
		<div
			v-if="open"
			class="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-dark-border bg-dark-card shadow-lg sm:w-96"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-dark-border px-4 py-3">
				<h3 class="text-sm font-semibold text-offwhite">Notifications</h3>
				<button
					v-if="unreadCount > 0"
					@click="markAllRead"
					class="text-xs text-concrete hover:text-punch"
				>
					Tout marquer comme lu
				</button>
			</div>

			<!-- List -->
			<ul class="max-h-96 overflow-y-auto divide-y divide-dark-border">
				<li
					v-for="n in notifications"
					:key="n.id"
					@click="markRead(n.id)"
					:class="[
						'flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-dark-elevated/60',
						n.readAt ? 'opacity-60' : '',
					]"
				>
					<!-- Avatar -->
					<div class="shrink-0">
						<img
							v-if="n.relatedAvatarUrl"
							:src="n.relatedAvatarUrl"
							:alt="n.relatedFirstname ?? ''"
							class="h-8 w-8 rounded-full ring-1 ring-dark-border"
						/>
						<div
							v-else
							class="flex h-8 w-8 items-center justify-center rounded-full bg-dark-elevated text-xs font-medium text-concrete"
						>
							{{ (n.relatedFirstname?.[0] ?? "") + (n.relatedLastname?.[0] ?? "") }}
						</div>
					</div>

					<!-- Content -->
					<div class="min-w-0 flex-1">
						<p class="text-sm text-offwhite leading-snug">{{ n.message }}</p>
						<p class="mt-1 text-xs text-concrete">{{ formatDate(n.createdAt) }} · {{ n.activityType }}</p>
					</div>

					<!-- Unread dot -->
					<div class="shrink-0 flex items-start pt-1">
						<span v-if="!n.readAt" class="h-2 w-2 rounded-full bg-punch" />
					</div>
				</li>
				<li v-if="notifications.length === 0" class="px-4 py-8 text-center text-sm text-concrete">
					Aucune notification pour le moment.
				</li>
			</ul>
		</div>
	</div>
</template>
