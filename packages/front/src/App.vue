<script setup lang="ts">
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import { useAuth } from "./composables/useAuth.js";

const { user } = useAuth();
const route = useRoute();
</script>

<template>
	<div class="min-h-screen bg-dark">
		<Navbar v-if="user" />
		<main
			:class="[
				'px-4 py-6 sm:px-6 lg:px-8',
				route.meta.fullWidth ? '' : 'mx-auto max-w-7xl',
			]"
		>
			<router-view />
		</main>
	</div>
</template>
