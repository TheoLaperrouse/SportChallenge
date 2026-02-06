<script setup lang="ts">
import { useAuth } from "../composables/useAuth.js";

const { user, logout } = useAuth();
</script>

<template>
	<nav class="border-b border-dark-border bg-dark-card">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-8">
					<span class="text-xl font-bold text-punch">Challenge Strava</span>
					<div class="flex gap-4">
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
				<div class="flex items-center gap-4">
					<div v-if="user" class="flex items-center gap-2">
						<img
							v-if="user.avatarUrl"
							:src="user.avatarUrl"
							:alt="user.firstname ?? ''"
							class="h-8 w-8 rounded-full ring-2 ring-punch"
						/>
						<span class="text-sm text-offwhite">
							{{ user.firstname }} {{ user.lastname }}
						</span>
					</div>
					<button
						@click="logout"
						class="rounded bg-dark-elevated px-3 py-1.5 text-sm text-concrete hover:bg-dark-border hover:text-offwhite"
					>
						Deconnexion
					</button>
				</div>
			</div>
		</div>
	</nav>
</template>
