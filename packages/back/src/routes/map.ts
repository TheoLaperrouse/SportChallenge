import { and, desc, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { Hono } from "hono";
import { config } from "../config/env.js";
import { db } from "../db/connection.js";
import { activities, users } from "../db/schema.js";
import { type AuthEnv, authMiddleware } from "../middleware/auth.js";

export const mapRoutes = new Hono<AuthEnv>();

mapRoutes.use("*", authMiddleware);

const TYPE_GROUPS: Record<string, string[]> = {
	Run: ["Run", "TrailRun"],
	Ride: ["Ride", "MountainBikeRide", "GravelRide", "EBikeRide", "VirtualRide"],
	Swim: ["Swim"],
};

mapRoutes.get("/activities", async (c) => {
	const typeFilter = c.req.query("type");

	const conditions = [isNotNull(activities.summaryPolyline)];

	if (typeFilter && TYPE_GROUPS[typeFilter]) {
		conditions.push(inArray(activities.type, TYPE_GROUPS[typeFilter]));
	}

	if (config.challenge.startDate) {
		conditions.push(gte(activities.startDate, config.challenge.startDate));
	}

	const result = await db
		.select({
			id: activities.id,
			name: activities.name,
			type: activities.type,
			distance: activities.distance,
			movingTime: activities.movingTime,
			totalElevationGain: activities.totalElevationGain,
			startDate: activities.startDate,
			summaryPolyline: activities.summaryPolyline,
			startLatlng: activities.startLatlng,
			userId: users.id,
			firstname: users.firstname,
			lastname: users.lastname,
			avatarUrl: users.avatarUrl,
		})
		.from(activities)
		.innerJoin(users, eq(activities.userId, users.id))
		.where(and(...conditions))
		.orderBy(desc(activities.startDate));

	return c.json(result);
});
