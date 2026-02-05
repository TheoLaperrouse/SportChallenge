import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "dotenv/config";

import { runMigrations } from "./db/migrate.js";
import { activitiesRoutes } from "./routes/activities.js";
import { authRoutes } from "./routes/auth.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { usersRoutes } from "./routes/users.js";
import { startScheduler } from "./scheduler/sync.js";

const app = new Hono();

app.use("*", logger());
app.use(
	"*",
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
	}),
);

app.route("/api/auth", authRoutes);
app.route("/api/activities", activitiesRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/users", usersRoutes);

app.get("/api/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT) || 3000;

await runMigrations();
startScheduler();
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
