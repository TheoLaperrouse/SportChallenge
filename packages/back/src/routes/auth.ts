import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { db } from "../db/connection.js";
import { sessions, users } from "../db/schema.js";
import { type AuthEnv, authMiddleware } from "../middleware/auth.js";
import { exchangeCode, getAuthUrl } from "../services/strava.js";

export const authRoutes = new Hono<AuthEnv>();

authRoutes.get("/login", (c) => {
	return c.redirect(getAuthUrl());
});

authRoutes.get("/callback", async (c) => {
	const code = c.req.query("code");
	const error = c.req.query("error");
	const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

	if (error) {
		console.error("Strava OAuth error:", error);
		return c.redirect(`${frontendUrl}/login`);
	}

	if (!code) {
		return c.json({ error: "Missing code parameter" }, 400);
	}

	try {
		const tokenData = await exchangeCode(code);
		const athlete = tokenData.athlete;

		const existing = await db.select().from(users).where(eq(users.stravaId, athlete.id)).limit(1);

		let userId: number;

		if (existing.length > 0) {
			await db
				.update(users)
				.set({
					username: athlete.username,
					firstname: athlete.firstname,
					lastname: athlete.lastname,
					avatarUrl: athlete.profile,
					accessToken: tokenData.access_token,
					refreshToken: tokenData.refresh_token,
					tokenExpiresAt: new Date(tokenData.expires_at * 1000),
					updatedAt: new Date(),
				})
				.where(eq(users.stravaId, athlete.id));
			userId = existing[0].id;
		} else {
			const inserted = await db
				.insert(users)
				.values({
					stravaId: athlete.id,
					username: athlete.username,
					firstname: athlete.firstname,
					lastname: athlete.lastname,
					avatarUrl: athlete.profile,
					accessToken: tokenData.access_token,
					refreshToken: tokenData.refresh_token,
					tokenExpiresAt: new Date(tokenData.expires_at * 1000),
				})
				.returning({ id: users.id });
			userId = inserted[0].id;
		}

		const sessionId = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

		await db.insert(sessions).values({
			id: sessionId,
			userId,
			expiresAt,
		});

		setCookie(c, "session_id", sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
			path: "/",
			maxAge: 30 * 24 * 60 * 60,
		});

		return c.redirect(`${frontendUrl}/dashboard`);
	} catch (err) {
		console.error("Strava callback error:", err);
		return c.redirect(`${frontendUrl}/login`);
	}
});

authRoutes.get("/me", authMiddleware, (c) => {
	const user = c.get("user");
	return c.json({
		id: user.id,
		stravaId: user.stravaId,
		username: user.username,
		firstname: user.firstname,
		lastname: user.lastname,
		avatarUrl: user.avatarUrl,
	});
});

authRoutes.post("/logout", async (c) => {
	const sessionId = getCookie(c, "session_id");
	if (sessionId) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	}
	deleteCookie(c, "session_id", { path: "/" });
	return c.json({ success: true });
});
