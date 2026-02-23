import { and, desc, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/connection.js";
import { notifications, users } from "../db/schema.js";
import { type AuthEnv, authMiddleware } from "../middleware/auth.js";

export const notificationsRoutes = new Hono<AuthEnv>();

notificationsRoutes.use("*", authMiddleware);

// GET /notifications — all notifications for current user (newest first)
notificationsRoutes.get("/", async (c) => {
	const user = c.get("user");

	const rows = await db
		.select({
			id: notifications.id,
			type: notifications.type,
			message: notifications.message,
			activityType: notifications.activityType,
			readAt: notifications.readAt,
			createdAt: notifications.createdAt,
			relatedUserId: notifications.relatedUserId,
			relatedFirstname: users.firstname,
			relatedLastname: users.lastname,
			relatedAvatarUrl: users.avatarUrl,
		})
		.from(notifications)
		.innerJoin(users, eq(notifications.relatedUserId, users.id))
		.where(eq(notifications.userId, user.id))
		.orderBy(desc(notifications.createdAt))
		.limit(50);

	const unreadCount = rows.filter((n) => n.readAt === null).length;

	return c.json({ notifications: rows, unreadCount });
});

// PATCH /notifications/:id/read — mark one notification as read
notificationsRoutes.patch("/:id/read", async (c) => {
	const user = c.get("user");
	const id = Number(c.req.param("id"));

	await db
		.update(notifications)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(notifications.id, id),
				eq(notifications.userId, user.id),
				isNull(notifications.readAt),
			),
		);

	return c.json({ ok: true });
});

// POST /notifications/read-all — mark all as read
notificationsRoutes.post("/read-all", async (c) => {
	const user = c.get("user");

	await db
		.update(notifications)
		.set({ readAt: new Date() })
		.where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

	return c.json({ ok: true });
});
