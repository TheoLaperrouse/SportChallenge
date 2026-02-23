import { and, eq, notInArray } from "drizzle-orm";
import cron from "node-cron";
import { db } from "../db/connection.js";
import { activities, users } from "../db/schema.js";
import { fetchActivities, getValidAccessToken } from "../services/strava.js";

interface UserForSync {
	id: number;
	username: string | null;
	accessToken: string | null;
	refreshToken: string | null;
	tokenExpiresAt: Date | null;
}

export async function syncUserActivities(user: UserForSync): Promise<number> {
	if (!user.accessToken || !user.refreshToken) {
		console.log(`[Scheduler] User ${user.id} (${user.username}) has no tokens, skipping`);
		return 0;
	}

	const tokens = await getValidAccessToken(
		user.accessToken,
		user.refreshToken,
		user.tokenExpiresAt,
	);

	if (!tokens) {
		console.log(`[Scheduler] User ${user.id} (${user.username}) token refresh failed, skipping`);
		return 0;
	}

	// Update tokens in DB if refreshed
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
	const syncedStravaIds: number[] = [];

	while (hasMore) {
		const stravaActivities = await fetchActivities(tokens.accessToken, page, 100);

		if (stravaActivities.length === 0) {
			hasMore = false;
			break;
		}

		for (const activity of stravaActivities) {
			syncedStravaIds.push(activity.id);
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

	// Clean up activities deleted on Strava
	if (syncedStravaIds.length > 0) {
		const deleted = await db
			.delete(activities)
			.where(and(eq(activities.userId, user.id), notInArray(activities.stravaId, syncedStravaIds)))
			.returning({ id: activities.id });
		if (deleted.length > 0) {
			console.log(
				`[Scheduler] Cleaned up ${deleted.length} deleted activities for user ${user.id} (${user.username})`,
			);
		}
	}

	return totalSynced;
}

async function syncAllUsers(): Promise<void> {
	console.log("[Scheduler] Starting hourly sync for all users");
	const allUsers = await db
		.select({
			id: users.id,
			username: users.username,
			accessToken: users.accessToken,
			refreshToken: users.refreshToken,
			tokenExpiresAt: users.tokenExpiresAt,
		})
		.from(users);

	console.log(`[Scheduler] Found ${allUsers.length} users to sync`);

	for (const user of allUsers) {
		try {
			const synced = await syncUserActivities(user);
			console.log(`[Scheduler] Synced ${synced} activities for user ${user.id} (${user.username})`);
		} catch (error) {
			console.error(`[Scheduler] Error syncing user ${user.id} (${user.username}):`, error);
		}
		// Wait 1 second between users to respect Strava rate limits
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	console.log("[Scheduler] Hourly sync completed");
}

export function startScheduler(): void {
	// Run every 15 minutes
	cron.schedule("*/15 * * * *", () => {
		syncAllUsers().catch((error) => {
			console.error("[Scheduler] Unhandled error in sync job:", error);
		});
	});

	console.log("[Scheduler] Sync scheduler started (every 15 minutes)");
}
