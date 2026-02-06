import { and, eq, gte, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { config } from "../config/env.js";
import { db } from "../db/connection.js";
import { activities, users } from "../db/schema.js";
import { type AuthEnv, authMiddleware } from "../middleware/auth.js";
import { fetchActivities, getValidAccessToken } from "../services/strava.js";

export const activitiesRoutes = new Hono<AuthEnv>();

activitiesRoutes.use("*", authMiddleware);

const TYPE_GROUPS: Record<string, string[]> = {
	Run: ["Run", "TrailRun"],
	Ride: ["Ride", "MountainBikeRide", "GravelRide", "EBikeRide", "VirtualRide"],
	Swim: ["Swim"],
};

activitiesRoutes.post("/sync", async (c) => {
	const user = c.get("user");

	if (!user.accessToken || !user.refreshToken) {
		return c.json({ error: "Missing Strava tokens" }, 401);
	}

	const tokens = await getValidAccessToken(
		user.accessToken,
		user.refreshToken,
		user.tokenExpiresAt,
	);

	if (!tokens) {
		return c.json({ error: "Unable to refresh Strava token" }, 401);
	}

	// Update tokens if refreshed
	if (tokens.accessToken !== user.accessToken) {
		await db
			.update(users)
			.set({
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				tokenExpiresAt: tokens.expiresAt,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id));
	}

	let page = 1;
	let totalSynced = 0;
	let hasMore = true;

	while (hasMore) {
		const stravaActivities = await fetchActivities(tokens.accessToken, page, 100);

		if (stravaActivities.length === 0) {
			hasMore = false;
			break;
		}

		for (const activity of stravaActivities) {
			await db
				.insert(activities)
				.values({
					stravaId: activity.id,
					userId: user.id,
					type: activity.type,
					name: activity.name,
					distance: activity.distance,
					movingTime: activity.moving_time,
					elapsedTime: activity.elapsed_time,
					totalElevationGain: activity.total_elevation_gain,
					startDate: new Date(activity.start_date),
					averageSpeed: activity.average_speed,
					maxSpeed: activity.max_speed,
					averageHeartrate: activity.average_heartrate ?? null,
					maxHeartrate: activity.max_heartrate ?? null,
					sportType: activity.sport_type,
					summaryPolyline: activity.map?.summary_polyline ?? null,
					startLatlng: activity.start_latlng
						? `${activity.start_latlng[0]},${activity.start_latlng[1]}`
						: null,
				})
				.onConflictDoUpdate({
					target: activities.stravaId,
					set: {
						name: activity.name,
						distance: activity.distance,
						movingTime: activity.moving_time,
						elapsedTime: activity.elapsed_time,
						totalElevationGain: activity.total_elevation_gain,
						averageSpeed: activity.average_speed,
						maxSpeed: activity.max_speed,
						averageHeartrate: activity.average_heartrate ?? null,
						maxHeartrate: activity.max_heartrate ?? null,
						summaryPolyline: activity.map?.summary_polyline ?? null,
						startLatlng: activity.start_latlng
							? `${activity.start_latlng[0]},${activity.start_latlng[1]}`
							: null,
					},
				});
			totalSynced++;
		}

		if (stravaActivities.length < 100) {
			hasMore = false;
		}
		page++;
	}

	return c.json({ synced: totalSynced });
});

activitiesRoutes.get("/", async (c) => {
	const user = c.get("user");
	const typeFilter = c.req.query("type");

	const conditions = [eq(activities.userId, user.id)];

	if (typeFilter && TYPE_GROUPS[typeFilter]) {
		conditions.push(inArray(activities.type, TYPE_GROUPS[typeFilter]));
	}

	if (config.challenge.startDate) {
		conditions.push(gte(activities.startDate, config.challenge.startDate));
	}

	const result = await db
		.select()
		.from(activities)
		.where(and(...conditions))
		.orderBy(activities.startDate);

	return c.json(result);
});
