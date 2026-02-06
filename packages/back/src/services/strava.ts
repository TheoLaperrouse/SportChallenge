const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_URL = "https://www.strava.com/api/v3";

function env(key: string): string {
	const value = process.env[key];
	if (!value) throw new Error(`Missing environment variable: ${key}`);
	return value;
}

export function getAuthUrl(): string {
	const params = new URLSearchParams({
		client_id: env("STRAVA_CLIENT_ID"),
		redirect_uri: env("STRAVA_REDIRECT_URI"),
		response_type: "code",
		scope: "read,activity:read_all",
		approval_prompt: "auto",
	});
	return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

interface StravaTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_at: number;
	athlete: {
		id: number;
		username: string;
		firstname: string;
		lastname: string;
		profile: string;
	};
}

export async function exchangeCode(code: string): Promise<StravaTokenResponse> {
	const response = await fetch(STRAVA_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_id: env("STRAVA_CLIENT_ID"),
			client_secret: env("STRAVA_CLIENT_SECRET"),
			code,
			grant_type: "authorization_code",
		}),
	});
	if (!response.ok) {
		throw new Error(`Strava token exchange failed: ${response.statusText}`);
	}
	return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
	access_token: string;
	refresh_token: string;
	expires_at: number;
}> {
	const response = await fetch(STRAVA_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_id: env("STRAVA_CLIENT_ID"),
			client_secret: env("STRAVA_CLIENT_SECRET"),
			refresh_token: refreshToken,
			grant_type: "refresh_token",
		}),
	});
	if (!response.ok) {
		throw new Error(`Strava token refresh failed: ${response.statusText}`);
	}
	return response.json();
}

export interface StravaActivity {
	id: number;
	type: string;
	sport_type: string;
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	start_date: string;
	average_speed: number;
	max_speed: number;
	average_heartrate?: number;
	max_heartrate?: number;
	map?: { summary_polyline: string | null };
	start_latlng?: [number, number] | null;
}

export async function fetchActivities(
	accessToken: string,
	page = 1,
	perPage = 100,
): Promise<StravaActivity[]> {
	const params = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	const response = await fetch(`${STRAVA_API_URL}/athlete/activities?${params.toString()}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!response.ok) {
		throw new Error(`Strava fetch activities failed: ${response.statusText}`);
	}
	return response.json();
}

export async function getValidAccessToken(
	accessToken: string,
	refreshToken: string,
	expiresAt: Date | null,
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> {
	if (expiresAt && expiresAt.getTime() > Date.now()) {
		return { accessToken, refreshToken, expiresAt };
	}
	const refreshed = await refreshAccessToken(refreshToken);
	return {
		accessToken: refreshed.access_token,
		refreshToken: refreshed.refresh_token,
		expiresAt: new Date(refreshed.expires_at * 1000),
	};
}
