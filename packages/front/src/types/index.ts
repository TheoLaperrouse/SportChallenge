export interface User {
	id: number;
	stravaId: number;
	username: string | null;
	firstname: string | null;
	lastname: string | null;
	avatarUrl: string | null;
}

export interface Activity {
	id: number;
	stravaId: number;
	userId: number;
	type: string | null;
	name: string | null;
	distance: number | null;
	movingTime: number | null;
	elapsedTime: number | null;
	totalElevationGain: number | null;
	startDate: string | null;
	averageSpeed: number | null;
	maxSpeed: number | null;
	averageHeartrate: number | null;
	maxHeartrate: number | null;
	sportType: string | null;
	createdAt: string;
}

export interface PersonalStats {
	totalActivities: number;
	totalDistance: string | null;
	totalMovingTime: string | null;
	totalElevation: string | null;
	avgSpeed: string | null;
	avgHeartrate: string | null;
	maxDistance: number | null;
}

export interface LeaderboardEntry {
	userId: number;
	username: string | null;
	firstname: string | null;
	lastname: string | null;
	avatarUrl: string | null;
	totalActivities: number;
	totalDistance: string | null;
	totalMovingTime: string | null;
	totalElevation: string | null;
}

export interface GlobalStats {
	totalActivities: number;
	totalDistance: string | null;
	totalMovingTime: string | null;
	totalElevation: string | null;
	totalParticipants: number;
}

export interface GlobalDashboardResponse {
	leaderboard: LeaderboardEntry[];
	stats: GlobalStats;
}

export type ActivityType = "Run" | "Ride" | "Swim";

export interface TimeseriesDataPoint {
	date: string;
	cumulativeDistance: number;
}

export interface AthleteTimeseries {
	userId: number;
	username: string | null;
	firstname: string | null;
	lastname: string | null;
	data: TimeseriesDataPoint[];
}
