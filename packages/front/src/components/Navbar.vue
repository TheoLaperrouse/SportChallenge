<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth.js";
import NotificationBell from "./NotificationBell.vue";

const { user, logout, deleteAccount } = useAuth();
const mobileMenuOpen = ref(false);

function confirmDeleteAccount() {
	if (
		window.confirm(
			"Voulez-vous vraiment supprimer votre compte ? Cette action est irr\u00e9versible.",
		)
	) {
		deleteAccount();
	}
}
</script>

<template>
	<nav class="border-b border-dark-border bg-dark-card">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-8">
					<span class="text-xl font-bold text-punch">Le Challenge</span>
					<div class="hidden gap-4 md:flex">
						<router-link
							to="/dashboard"
							class="px-3 py-2 text-sm font-medium text-offwhite hover:text-punch"
							active-class="text-punch border-b-2 border-punch"
						>
							Mon Dashboard
						</router-link>
						<router-link
							to="/global"
							class="px-3 py-2 text-sm font-medium text-offwhite hover:text-punch"
							active-class="text-punch border-b-2 border-punch"
						>
							Classement
						</router-link>
						<router-link
							to="/map"
							class="px-3 py-2 text-sm font-medium text-offwhite hover:text-punch"
							active-class="text-punch border-b-2 border-punch"
						>
							Carte
						</router-link>
					</div>
				</div>
				<div class="flex items-center gap-2 sm:gap-4">
					<div v-if="user" class="flex items-center gap-2">
						<img
							v-if="user.avatarUrl"
							:src="user.avatarUrl"
							:alt="user.firstname ?? ''"
							class="h-8 w-8 rounded-full ring-2 ring-punch"
						/>
						<span class="hidden text-sm text-offwhite sm:inline">
							{{ user.firstname }} {{ user.lastname }}
						</span>
					</div>
					<NotificationBell />
					<button
						@click="confirmDeleteAccount"
						class="hidden rounded bg-dark-elevated px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 md:block"
					>
						Supprimer mon compte
					</button>
					<button
						@click="logout"
						class="hidden rounded bg-dark-elevated px-3 py-1.5 text-sm text-concrete hover:bg-dark-border hover:text-offwhite md:block"
					>
						Déconnexion
					</button>
					<button
						class="inline-flex items-center justify-center rounded p-2 text-offwhite hover:bg-dark-elevated md:hidden"
						@click="mobileMenuOpen = !mobileMenuOpen"
					>
						<svg v-if="!mobileMenuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
						<svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>
		</div>
		<div v-if="mobileMenuOpen" class="border-t border-dark-border md:hidden">
			<div class="space-y-1 px-4 py-3">
				<router-link
					to="/dashboard"
					class="block rounded px-3 py-2 text-sm font-medium text-offwhite hover:bg-dark-elevated hover:text-punch"
					active-class="text-punch bg-dark-elevated"
					@click="mobileMenuOpen = false"
				>
					Mon Dashboard
				</router-link>
				<router-link
					to="/global"
					class="block rounded px-3 py-2 text-sm font-medium text-offwhite hover:bg-dark-elevated hover:text-punch"
					active-class="text-punch bg-dark-elevated"
					@click="mobileMenuOpen = false"
				>
					Classement
				</router-link>
				<router-link
					to="/map"
					class="block rounded px-3 py-2 text-sm font-medium text-offwhite hover:bg-dark-elevated hover:text-punch"
					active-class="text-punch bg-dark-elevated"
					@click="mobileMenuOpen = false"
				>
					Carte
				</router-link>
				<div class="my-2 border-t border-dark-border" />
				<button
					@click="logout"
					class="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-concrete hover:bg-dark-elevated hover:text-offwhite"
				>
					<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					Déconnexion
				</button>
				<button
					@click="confirmDeleteAccount"
					class="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
				>
					<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					Supprimer mon compte
				</button>
			</div>
		</div>
	</nav>
</template>
