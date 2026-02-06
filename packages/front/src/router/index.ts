import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth.js";
import GlobalDashboard from "../pages/GlobalDashboard.vue";
import LoginPage from "../pages/LoginPage.vue";
import MapPage from "../pages/MapPage.vue";
import PersonalDashboard from "../pages/PersonalDashboard.vue";

const routes = [
	{ path: "/", redirect: "/login" },
	{ path: "/login", component: LoginPage, meta: { guest: true } },
	{ path: "/dashboard", component: PersonalDashboard, meta: { requiresAuth: true } },
	{ path: "/global", component: GlobalDashboard, meta: { requiresAuth: true } },
	{ path: "/map", component: MapPage, meta: { requiresAuth: true, fullWidth: true } },
];

export const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach(async (to) => {
	const { user, fetchUser } = useAuth();

	if (!user.value) {
		await fetchUser();
	}

	if (to.meta.requiresAuth && !user.value) {
		return "/login";
	}
	if (to.meta.guest && user.value) {
		return "/dashboard";
	}
});
