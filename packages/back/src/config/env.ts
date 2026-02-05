function getEnv(key: string, required = true): string {
	const value = process.env[key];
	if (required && !value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value ?? "";
}

function getOptionalDate(key: string): Date | null {
	const value = process.env[key];
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid date format for ${key}: ${value}`);
	}
	return date;
}

export const config = {
	database: {
		url: getEnv("DATABASE_URL"),
	},
	strava: {
		clientId: getEnv("STRAVA_CLIENT_ID"),
		clientSecret: getEnv("STRAVA_CLIENT_SECRET"),
		redirectUri: getEnv("STRAVA_REDIRECT_URI"),
	},
	session: {
		secret: getEnv("SESSION_SECRET"),
	},
	frontend: {
		url: getEnv("FRONTEND_URL", false) || "http://localhost:5173",
	},
	port: Number(process.env.PORT) || 3000,
	challenge: {
		startDate: getOptionalDate("CHALLENGE_START_DATE"),
	},
};
