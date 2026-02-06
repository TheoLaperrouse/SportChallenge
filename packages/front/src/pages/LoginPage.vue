<script setup lang="ts">
import { useAuth } from "../composables/useAuth.js";

const { login } = useAuth();

const features = [
	{
		icon: "sync",
		title: "Synchronisation Strava",
		description:
			"Importez automatiquement toutes vos activités depuis votre compte Strava en un clic.",
	},
	{
		icon: "chart",
		title: "Statistiques personnelles",
		description: "Visualisez vos distances, temps, dénivelés et progressions mois par mois.",
	},
	{
		icon: "trophy",
		title: "Classement entre amis",
		description:
			"Comparez vos performances avec les autres participants et grimpez dans le leaderboard.",
	},
	{
		icon: "filter",
		title: "Multi-sport",
		description: "Filtrez par discipline : course et trail, vélo, ou natation.",
	},
];
</script>

<template>
	<div class="-mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
		<!-- Hero -->
		<section
			class="relative overflow-hidden bg-dark px-6 py-24 text-white sm:px-12 lg:px-24"
		>
			<div
				class="absolute inset-0 opacity-20"
				style="
					background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><path d=%22M30 0L60 30L30 60L0 30Z%22 fill=%22none%22 stroke=%22%23FF6A00%22 stroke-width=%221%22/></svg>');
				"
			/>
			<div class="relative mx-auto max-w-4xl text-center">
				<div class="mb-6 inline-flex items-center gap-2 rounded-full bg-punch/20 px-4 py-1.5 text-sm font-medium text-punch backdrop-blur-sm">
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
						<path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
					</svg>
					Powered by Strava
				</div>

				<h1 class="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
					<span class="text-offwhite">Challenge</span>
					<span class="text-punch"> Strava</span>
				</h1>
				<p class="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-concrete">
					Relevez le challenge entre amis ! Synchronisez vos activit&eacute;s sportives, suivez
					vos performances et d&eacute;couvrez qui parcourt le plus de kilom&egrave;tres.
				</p>

				<div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
					<button
						@click="login"
						class="inline-flex items-center gap-3 rounded-xl bg-neon px-8 py-4 text-lg font-bold text-dark shadow-xl transition-all hover:scale-105 hover:bg-neon-light hover:shadow-2xl hover:shadow-neon/20 active:scale-100"
					>
						<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
							<path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
						</svg>
						Se connecter avec Strava
					</button>
					<a
						href="#features"
						class="inline-flex items-center gap-2 rounded-xl border-2 border-concrete/40 px-6 py-4 text-lg font-semibold text-offwhite backdrop-blur-sm transition-colors hover:border-punch hover:text-punch"
					>
						En savoir plus
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					</a>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section id="features" class="bg-dark-card px-6 py-20 sm:px-12 lg:px-24">
			<div class="mx-auto max-w-5xl">
				<h2 class="text-center text-3xl font-bold text-offwhite sm:text-4xl">
					Comment &ccedil;a marche ?
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-center text-lg text-concrete">
					Trois &eacute;tapes suffisent pour rejoindre le challenge et comparer vos performances.
				</p>

				<div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					<div
						v-for="feature in features"
						:key="feature.title"
						class="group rounded-2xl border border-dark-border bg-dark-elevated/50 p-6 transition-all hover:border-punch hover:bg-dark-elevated"
					>
						<!-- Icons -->
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-punch/20 text-punch transition-colors group-hover:bg-punch group-hover:text-dark">
							<svg v-if="feature.icon === 'sync'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<svg v-else-if="feature.icon === 'chart'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
							<svg v-else-if="feature.icon === 'trophy'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 3h14a1 1 0 011 1v2a7 7 0 01-4 6.33V16a1 1 0 01-1 1h-1v3h-4v-3H9a1 1 0 01-1-1v-3.67A7 7 0 014 6V4a1 1 0 011-1z" />
							</svg>
							<svg v-else-if="feature.icon === 'filter'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-offwhite">{{ feature.title }}</h3>
						<p class="mt-2 text-sm leading-relaxed text-concrete">
							{{ feature.description }}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Steps -->
		<section class="bg-dark px-6 py-20 sm:px-12 lg:px-24">
			<div class="mx-auto max-w-3xl">
				<h2 class="text-center text-3xl font-bold text-offwhite sm:text-4xl">
					Pr&ecirc;t en 3 &eacute;tapes
				</h2>
				<div class="mt-14 space-y-10">
					<div class="flex gap-6">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-punch text-lg font-bold text-dark">
							1
						</div>
						<div>
							<h3 class="text-lg font-semibold text-offwhite">Connectez votre compte Strava</h3>
							<p class="mt-1 text-concrete">
								Authentifiez-vous en un clic via Strava OAuth. Aucun mot de passe &agrave; cr&eacute;er.
							</p>
						</div>
					</div>
					<div class="flex gap-6">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-punch text-lg font-bold text-dark">
							2
						</div>
						<div>
							<h3 class="text-lg font-semibold text-offwhite">Synchronisez vos activit&eacute;s</h3>
							<p class="mt-1 text-concrete">
								Importez l'historique de vos courses, sorties v&eacute;lo et s&eacute;ances de natation
								depuis Strava.
							</p>
						</div>
					</div>
					<div class="flex gap-6">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-punch text-lg font-bold text-dark">
							3
						</div>
						<div>
							<h3 class="text-lg font-semibold text-offwhite">Comparez et progressez</h3>
							<p class="mt-1 text-concrete">
								Consultez vos stats, suivez votre progression et d&eacute;fiez vos amis au classement
								g&eacute;n&eacute;ral.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA -->
		<section class="bg-dark-card px-6 py-20 sm:px-12 lg:px-24">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold text-offwhite">
					Rejoignez le challenge maintenant
				</h2>
				<p class="mt-4 text-lg text-concrete">
					C'est gratuit, rapide, et il suffit d'un compte Strava.
				</p>
				<button
					@click="login"
					class="mt-8 inline-flex items-center gap-3 rounded-xl bg-neon px-8 py-4 text-lg font-bold text-dark shadow-lg transition-all hover:scale-105 hover:bg-neon-light hover:shadow-xl hover:shadow-neon/20 active:scale-100"
				>
					<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
						<path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
					</svg>
					Se connecter avec Strava
				</button>
			</div>
		</section>
	</div>
</template>
