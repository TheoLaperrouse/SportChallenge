import {
	bigint,
	integer,
	pgTable,
	real,
	serial,
	text,
	timestamp,
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
