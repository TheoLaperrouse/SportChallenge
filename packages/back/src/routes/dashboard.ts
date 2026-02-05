import { and, avg, count, eq, gte, inArray, max, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { config } from "../config/env.js";
import { db } from "../db/connection.js";
import { activities, users } from "../db/schema.js";
import { type AuthEnv, authMiddleware } from "../middleware/auth.js";

export const dashboardRoutes = new Hono<AuthEnv>();

dashboardRoutes.use("*", authMiddleware);

const TYPE_GROUPS: Record<string, string[]> = {
	Run: ["Run", "TrailRun"],
	Ride: ["Ride", "MountainBikeRide", "GravelRide", "EBikeRide", "VirtualRide"],
	Swim: ["Swim"],
};

dashboardRoutes.get("/personal", async (c) => {
	const user = c.get("user");
	const typeFilter = c.req.query("type");

	const conditions = [eq(activities.userId, user.id)];

	if (typeFilter && TYPE_GROUPS[typeFilter]) {
		conditions.push(inArray(activities.type, TYPE_GROUPS[typeFilter]));
	}

	if (config.challenge.startDate) {
		conditions.push(gte(activities.startDate, config.challenge.startDate));
	}

	const stats = await db
		.select({
			totalActivities: count(activities.id),
			totalDistance: sum(activities.distance),
			totalMovingTime: sum(activities.movingTime),
			totalElevation: sum(activities.totalElevationGain),
			avgSpeed: avg(activities.averageSpeed),
			avgHeartrate: avg(activities.averageHeartrate),
			maxDistance: max(activities.distance),
		})
		.from(activities)
		.where(and(...conditions));

	return c.json(stats[0] ?? {});
});

dashboardRoutes.get("/global", async (c) => {
	const typeFilter = c.req.query("type");

	const conditions = [];

	if (typeFilter && TYPE_GROUPS[typeFilter]) {
		conditions.push(inArray(activities.type, TYPE_GROUPS[typeFilter]));
	}

	if (config.challenge.startDate) {
		conditions.push(gte(activities.startDate, config.challenge.startDate));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const leaderboard = await db
		.select({
			userId: users.id,
			username: users.username,
			firstname: users.firstname,
			lastname: users.lastname,
			avatarUrl: users.avatarUrl,
			totalActivities: count(activities.id),
			totalDistance: sum(activities.distance),
			totalMovingTime: sum(activities.movingTime),
			totalElevation: sum(activities.totalElevationGain),
		})
		.from(activities)
		.innerJoin(users, eq(activities.userId, users.id))
		.where(whereClause)
		.groupBy(users.id, users.username, users.firstname, users.lastname, users.avatarUrl)
		.orderBy(sql`sum(${activities.distance}) desc nulls last`);

	const globalStats = await db
		.select({
			totalActivities: count(activities.id),
			totalDistance: sum(activities.distance),
			totalMovingTime: sum(activities.movingTime),
			totalElevation: sum(activities.totalElevationGain),
			totalParticipants: sql<number>`count(distinct ${activities.userId})`,
		})
		.from(activities)
		.where(whereClause);

	return c.json({
		leaderboard,
		stats: globalStats[0] ?? {},
	});
});

dashboardRoutes.get("/timeseries", async (c) => {
	const typeFilter = c.req.query("type");

	const conditions = [];

	if (typeFilter && TYPE_GROUPS[typeFilter]) {
		conditions.push(inArray(activities.type, TYPE_GROUPS[typeFilter]));
	}

	if (config.challenge.startDate) {
		conditions.push(gte(activities.startDate, config.challenge.startDate));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Get daily distances grouped by user and date
	const dailyData = await db
		.select({
			userId: activities.userId,
			username: users.username,
			firstname: users.firstname,
			lastname: users.lastname,
			date: sql<string>`DATE(${activities.startDate})`.as("date"),
			totalDistance: sum(activities.distance),
		})
		.from(activities)
		.innerJoin(users, eq(activities.userId, users.id))
		.where(whereClause)
		.groupBy(
			activities.userId,
			users.username,
			users.firstname,
			users.lastname,
			sql`DATE(${activities.startDate})`,
		)
		.orderBy(activities.userId, sql`DATE(${activities.startDate})`);

	// Group by user and compute cumulative distances
	const userMap = new Map<
		number,
		{
			userId: number;
			username: string | null;
			firstname: string | null;
			lastname: string | null;
			data: { date: string; cumulativeDistance: number }[];
		}
	>();

	for (const row of dailyData) {
		if (!userMap.has(row.userId)) {
			userMap.set(row.userId, {
				userId: row.userId,
				username: row.username,
				firstname: row.firstname,
				lastname: row.lastname,
				data: [],
			});
		}

		const userData = userMap.get(row.userId);
		if (!userData) continue;
		const prevCumulative =
			userData.data.length > 0 ? userData.data[userData.data.length - 1].cumulativeDistance : 0;
		const distance = Number(row.totalDistance) || 0;

		userData.data.push({
			date: row.date,
			cumulativeDistance: prevCumulative + distance,
		});
	}

	return c.json(Array.from(userMap.values()));
});
