import {
	bigint,
	integer,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	stravaId: bigint("strava_id", { mode: "number" }).unique().notNull(),
	username: varchar("username", { length: 255 }),
	firstname: varchar("firstname", { length: 255 }),
	lastname: varchar("lastname", { length: 255 }),
	avatarUrl: varchar("avatar_url", { length: 512 }),
	accessToken: varchar("access_token", { length: 512 }),
	refreshToken: varchar("refresh_token", { length: 512 }),
	tokenExpiresAt: timestamp("token_expires_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: varchar("id", { length: 255 }).primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
	id: serial("id").primaryKey(),
	stravaId: bigint("strava_id", { mode: "number" }).unique().notNull(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	type: varchar("type", { length: 50 }),
	name: varchar("name", { length: 512 }),
	distance: real("distance"),
	movingTime: integer("moving_time"),
	elapsedTime: integer("elapsed_time"),
	totalElevationGain: real("total_elevation_gain"),
	startDate: timestamp("start_date"),
	averageSpeed: real("average_speed"),
	maxSpeed: real("max_speed"),
	averageHeartrate: real("average_heartrate"),
	maxHeartrate: real("max_heartrate"),
	sportType: varchar("sport_type", { length: 50 }),
	summaryPolyline: text("summary_polyline"),
	startLatlng: varchar("start_latlng", { length: 100 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const distanceSnapshots = pgTable(
	"distance_snapshots",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		activityType: varchar("activity_type", { length: 50 }).notNull(),
		totalDistance: real("total_distance").notNull().default(0),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [unique("uniq_snapshot_user_type").on(t.userId, t.activityType)],
);

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	type: varchar("type", { length: 20 }).notNull(), // "overtook" | "overtaken"
	message: text("message").notNull(),
	relatedUserId: integer("related_user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	activityType: varchar("activity_type", { length: 50 }).notNull(),
	readAt: timestamp("read_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
