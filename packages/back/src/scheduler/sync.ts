import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import cron from "node-cron";
import { db } from "../db/connection.js";
import { activities, distanceSnapshots, notifications, users } from "../db/schema.js";
import { fetchActivities, getValidAccessToken } from "../services/strava.js";

interface UserForSync {
	id: number;
	username: string | null;
	accessToken: string | null;
	refreshToken: string | null;
	tokenExpiresAt: Date | null;
	lastSyncedAt: Date | null;
}

const TYPE_GROUPS: Record<string, string[]> = {
	Run: ["Run", "TrailRun"],
	Ride: ["Ride", "MountainBikeRide", "GravelRide", "EBikeRide", "VirtualRide"],
	Swim: ["Swim"],
};

const MIN_DISTANCE_FOR_NOTIFICATIONS: Record<string, number> = {
	Run: 10000,
	Ride: 20000,
	Swim: 1000,
};

const OVERTOOK_MESSAGES: Record<string, string[]> = {
	Run: [
		"Tu viens de dépasser {name} à la course ! Kilian Jornet, t'as un sérieux concurrent 🏔️",
		"Bruit de semelles dans le couloir… c'est toi qui doubles {name} ! Boum 💨",
		"GPS validé, Strava approuvé : tu es officiellement devant {name} ! 📱",
		"Ta playlist a choisi le bon moment : tu explosais {name} à la vitesse de la musique 🎧",
		"Les mollets ont parlé, le classement a répondu : {name} te regarde les talons 🦵",
		"Allez, avouons-le : {name} n'a pas vu venir. Tu assures vraiment ! 😎",
		"La souffrance paie : tu dépasses {name} ! Chaque kilomètre comptait 🔥",
		"La boue, la pluie, le vent ? Rien ne t'a arrêté(e). {name} est derrière, bravo 🌧️",
		"{name} avait pourtant l'air en forme… mais pas autant que toi aujourd'hui ! 💪",
		"Pas de pitié pour {name} : tu viens de le/la doubler au compteur de bornes ! 😤",
		"Statistiquement, tu cours mieux que {name} ce mois-ci. Ça mérite une pizza 🍕",
		"Semi, marathon, trail ? Peu importe : {name} est dans ton rétroviseur 🏃",
		"La foulée légère, le classement qui grimpe : {name} est K.O. 🥊",
		"Bruit de baskets sur l'asphalte, {name} s'éloigne… dans le rétro ! Tu traces 🏙️",
		"Woah ! Tu doubles {name} comme si c'était facile. Respect total 🤜",
	],
	Ride: [
		"Coup de pédale décisif : {name} est dans ton sillage ! 🚲",
		"Tour de France version locale : tu viens de lâcher {name} dans la montée 🗻",
		"Tadej Pogačar, méfie-toi. {name} regarde déjà ton numéro de dossard disparaître 🏅",
		"Développement maxi, mollets en feu : tu passes {name} comme une fusée 🚀",
		"La chaîne bien huilée, le vent dans le dos… et {name} dans le rétroviseur 🌬️",
		"{name} voulait garder sa place… mais ton braquet en a décidé autrement 🔧",
		"Wout Van Aert ? Non, c'est toi qui viens de dépasser {name} ! 💛",
		"Le Strava ne ment pas : tu roules plus loin que {name}. La baguette est méritée 🥖",
		"Tu fais chauffer le bitume et {name} ne peut que regarder. Impressionnant 🔥",
		"Peloton, breakaway, victoire d'étape : tu prends la tête sur {name} aujourd'hui 🏆",
		"{name} a dû freiner… toi, tu n'as pas ralenti une seconde ! Superbe 👏",
		"Maîtrise du vélo, du classement et de {name} : tout est sous contrôle 😎",
		"Petite côte ou plaine, tu gères les deux mieux que {name} ! Bravo le cycliste 🤌",
		"On ne te donne pas la Marguerite, mais tu doubles {name} au compteur de km ! 🌸",
		"Deux roues, deux mollets, et un classement en ta faveur : tu bats {name} ! 🎯",
	],
	Swim: [
		"Brasse, crawl ou dauphin : peu importe la nage, tu dépasses {name} dans le bassin ! 🏊",
		"{name} a coulé sous ta vague. Michael Phelps, c'est toi ! 🌊",
		"Tu sors de l'eau devant {name} ! Poséidon est fier de toi 🔱",
		"Longueur après longueur, tu as distancé {name}. L'eau t'appartient ! 💧",
		"La piscine a un nouveau roi/reine : toi. {name} regarde de loin 👑",
		"Tu nages plus loin que {name} ce mois-ci ! Flipper aurait été jaloux 🐬",
		"{name} pensait qu'on nageait tranquille… mais toi, t'étais en mode compétition ! 😏",
		"Bonnet et lunettes en place, {name} derrière : parfaite tenue de champion(ne) 🥽",
		"On aurait dit une raie manta, tellement tu glisses dans l'eau devant {name} 🌊",
		"Plouf ! C'est le bruit de {name} qui plonge pour tenter de te rattraper. Trop tard 😄",
		"La chlore dans les cheveux et le sourire aux lèvres : tu dépasses {name} ! 🏊",
		"Tes bras ont parlé, le classement a suivi : {name} est maintenant derrière toi 💪",
		"Mètre après mètre, tu as distancé {name}. La technique paie ! 🔬",
		"Longueur de bassin ou open water, tu gères les deux mieux que {name} ! 🏆",
		"Armada de mouvements de bras : {name} est à la traîne dans ton sillage 🚣",
	],
};

const OVERTAKEN_MESSAGES: Record<string, string[]> = {
	Run: [
		"{name} te dépasse à la course ! Les chaussures t'attendent dans le couloir 👟",
		"Bip bip ! {name} te passe devant comme le Roadrunner. Meep meep 🐦💨",
		"Mauvaise nouvelle : {name} court plus que toi. Bonne nouvelle : Netflix peut attendre 📺",
		"{name} vient de doubler ton compteur de km. Ta réponse : dès demain matin 🌅",
		"Tu te demandes d'où vient ce bruit de semelles ? C'est {name} qui te passe devant 👂",
		"Ton canapé t'a sûrement menti : {name} a couru pendant que tu « récupérais » 🛋️",
		"{name} te dépasse ! C'est peut-être le signe que la sieste d'après-midi, c'est fini 😴",
		"Le classement ne ment pas : {name} est en avance. Mais le mois n'est pas terminé ! 📅",
		"Allez, t'inquiète : {name} a juste eu une semaine de feu. La tienne arrive ! 💡",
		"Techniquement, {name} court juste un peu plus que toi. Mais ça se règle en 2 sorties !",
		"La route est longue, et {name} vient de te doubler. Le rebond est pour demain 🔄",
		"Personne ne l'a vu venir, pas même toi. {name} est devant. Bon courage champion(ne) 😬",
		"Ils ont dit : « le sport, c'est bon pour le moral ». {name} vient de te le rappeler 😂",
		"Les bornes ont été comptées. {name} est devant. La revanche est en route ! 🏃",
		"Médaille de la régularité pour {name}. Mais toi, t'es encore chaud(e) pour la guerre ! 🥇",
	],
	Ride: [
		"{name} pédale plus que toi ce mois-ci. C'est le moment de regonfler les pneus 🔧",
		"Tour de France local : {name} vient de te lâcher dans la montée 😤",
		"Crevaison morale : {name} te dépasse au compteur de km. Ressors le vélo ! 🚲",
		"Le dérailleur ? C'est ton classement. {name} est désormais devant toi 😬",
		"{name} vient de t'imposer une remontée de cols. Mais t'es costaud(e), allez ! 🏔️",
		"Pas de VAE autorisé, mais {name} roule comme s'il/elle en avait un. Jalousie 😅",
		"La route est plate mais {name} a quand même trouvé le moyen de te doubler 🌾",
		"Le Strava a rendu son verdict : {name} roule plus loin que toi. La tête dans le guidon ! 📱",
		"Bonk ! C'est l'énergie qui lâche, ou juste {name} qui te passe devant ? 🍌",
		"Chaque km compte. Et là, {name} en a plus que toi. Ça mérite une sortie ce weekend 🗓️",
		"{name} t'a doublé sur la route. Mais personne n'a encore coupé la ligne d'arrivée ! 🏁",
		"Ta selle était peut-être trop haute, ou {name} simplement trop motivé(e). À toi de voir 🛠️",
		"Sprint final ou sortie longue, {name} fait les deux mieux ce mois-ci. Mais rien n'est joué ! 🎲",
		"Tu pensais avoir assuré ta place… {name} a dit non. Coup de pédale, vite ! ⚡",
		"Petit coup de mou sur le vélo ? {name} en a profité. La revanche se prépare maintenant 🔄",
	],
	Swim: [
		"{name} nage plus loin que toi ce mois-ci. Ressors les palmes, y'a pas de honte ! 🤿",
		"Plongeon raté ? {name} est devant toi au compteur de mètres. L'eau attend ta revanche ! 💧",
		"Le bassin ne ment pas : {name} te devance. Prochain entraînement, tu mets le turbo ! 🏊",
		"Michael Phelps a un message pour toi : {name} est devant. Retourne dans le grand bain ! 🌊",
		"{name} a sorti les dauphin-kicks et te laisse derrière. Magnifique, légèrement humiliant 🐬",
		"L'eau n'a pas de mémoire, mais Strava si : {name} te dépasse au compteur ! 📱",
		"Tu pensais nager vite ? {name} nage plus loin. Bonnet à oreilles et on repart ! 🧢",
		"Bonne nouvelle : il reste de l'eau dans la piscine. {name} est devant, mais tu peux rattraper ! 💦",
		"{name} t'a subtilisé ta lane et ta place dans le classement. Réponse en couleur… de nage ! 🎨",
		"Peut-être que {name} a des palmes secrètes ? En tout cas, il/elle est devant toi ! 🦈",
		"{name} te devance en natation. La revanche se prépare longueur par longueur 🔄",
		"L'eau est froide, la motivation l'est moins : {name} t'a doublé(e). Plongeons ! 🏊",
		"Le chrono est impitoyable : {name} est devant toi. Mais tu connais la longueur du bassin, non ? 🏁",
		"On dit que l'eau ne résiste pas à celui qui l'affronte. Dis ça à {name}… ou nage plus ! 😅",
		"Vlad Morozov ou {name} : les deux nagent mieux que toi ce mois-ci. En piste ! 🥈",
	],
};

function pickMessage(
	messages: Record<string, string[]>,
	activityType: string,
	name: string,
): string {
	const pool = messages[activityType] ?? Object.values(messages)[0];
	const template = pool[Math.floor(Math.random() * pool.length)];
	return template.replace("{name}", name);
}

function getDisplayName(
	firstname: string | null,
	lastname: string | null,
	username: string | null,
): string {
	if (firstname && lastname) return `${firstname} ${lastname}`;
	if (firstname) return firstname;
	return username ?? "Quelqu'un";
}

async function checkOvertaking(): Promise<void> {
	const allUsers = await db
		.select({
			id: users.id,
			firstname: users.firstname,
			lastname: users.lastname,
			username: users.username,
		})
		.from(users);

	const userMap = new Map(allUsers.map((u) => [u.id, u]));

	for (const activityType of Object.keys(TYPE_GROUPS)) {
		const typeValues = TYPE_GROUPS[activityType];

		// Compute current cumulative distances for all users
		const currentRows = await db
			.select({
				userId: activities.userId,
				totalDistance: sql<number>`coalesce(sum(${activities.distance}), 0)`,
			})
			.from(activities)
			.where(inArray(activities.type, typeValues))
			.groupBy(activities.userId);

		const currMap = new Map(currentRows.map((r) => [r.userId, r.totalDistance]));

		// Get previous snapshots
		const prevRows = await db
			.select({ userId: distanceSnapshots.userId, totalDistance: distanceSnapshots.totalDistance })
			.from(distanceSnapshots)
			.where(eq(distanceSnapshots.activityType, activityType));

		const prevMap = new Map(prevRows.map((r) => [r.userId, r.totalDistance]));

		// Only users above the minimum distance threshold are eligible for notifications
		const minDist = MIN_DISTANCE_FOR_NOTIFICATIONS[activityType] ?? 20000;
		const eligible = Array.from(currMap.entries()).filter(([, dist]) => dist >= minDist);

		// Detect overtaking: A just surpassed B when A.curr > B.curr AND A.prev <= B.prev
		for (const [userAId, distA] of eligible) {
			for (const [userBId, distB] of eligible) {
				if (userAId === userBId) continue;
				const prevDistA = prevMap.get(userAId) ?? 0;
				const prevDistB = prevMap.get(userBId) ?? 0;

				if (distA > distB && prevDistA <= prevDistB) {
					const userA = userMap.get(userAId);
					const userB = userMap.get(userBId);
					if (!userA || !userB) continue;

					const nameA = getDisplayName(userA.firstname, userA.lastname, userA.username);
					const nameB = getDisplayName(userB.firstname, userB.lastname, userB.username);

					await db.insert(notifications).values({
						userId: userAId,
						type: "overtook",
						message: pickMessage(OVERTOOK_MESSAGES, activityType, nameB),
						relatedUserId: userBId,
						activityType,
					});

					await db.insert(notifications).values({
						userId: userBId,
						type: "overtaken",
						message: pickMessage(OVERTAKEN_MESSAGES, activityType, nameA),
						relatedUserId: userAId,
						activityType,
					});

					console.log(
						`[Notifications] ${nameA} overtook ${nameB} in ${activityType} (${(distA / 1000).toFixed(1)}km vs ${(distB / 1000).toFixed(1)}km)`,
					);
				}
			}
		}

		// Update snapshots for all users who have any distance
		for (const [userId, totalDistance] of currMap) {
			await db
				.insert(distanceSnapshots)
				.values({ userId, activityType, totalDistance, updatedAt: new Date() })
				.onConflictDoUpdate({
					target: [distanceSnapshots.userId, distanceSnapshots.activityType],
					set: { totalDistance, updatedAt: new Date() },
				});
		}
	}
}

export async function syncUserActivities(
	user: UserForSync,
	options: { full?: boolean } = {},
): Promise<number> {
	const full = options.full ?? false;
	if (!user.accessToken || !user.refreshToken) {
		console.log(`[Scheduler] User ${user.id} (${user.username}) has no tokens, skipping`);
		return 0;
	}

	const tokens = await getValidAccessToken(
		user.accessToken,
		user.refreshToken,
		user.tokenExpiresAt,
	);

	if (!tokens) {
		console.log(`[Scheduler] User ${user.id} (${user.username}) token refresh failed, skipping`);
		return 0;
	}

	// Update tokens in DB if refreshed
	if (tokens.accessToken !== user.accessToken) {
		await db
			.update(users)
			.set({
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				tokenExpiresAt: tokens.expiresAt,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id));
	}

	let page = 1;
	let totalSynced = 0;
	let hasMore = true;
	const syncedStravaIds: number[] = [];
	const syncStartedAt = new Date();
	const after = full ? undefined : (user.lastSyncedAt ?? undefined);

	while (hasMore) {
		const stravaActivities = await fetchActivities(tokens.accessToken, page, 100, after);

		if (stravaActivities.length === 0) {
			hasMore = false;
			break;
		}

		for (const activity of stravaActivities) {
			syncedStravaIds.push(activity.id);
			await db
				.insert(activities)
				.values({
					stravaId: activity.id,
					userId: user.id,
					type: activity.type,
					name: activity.name,
					distance: activity.distance,
					movingTime: activity.moving_time,
					elapsedTime: activity.elapsed_time,
					totalElevationGain: activity.total_elevation_gain,
					startDate: new Date(activity.start_date),
					averageSpeed: activity.average_speed,
					maxSpeed: activity.max_speed,
					averageHeartrate: activity.average_heartrate ?? null,
					maxHeartrate: activity.max_heartrate ?? null,
					sportType: activity.sport_type,
					summaryPolyline: activity.map?.summary_polyline ?? null,
					startLatlng: activity.start_latlng
						? `${activity.start_latlng[0]},${activity.start_latlng[1]}`
						: null,
				})
				.onConflictDoUpdate({
					target: activities.stravaId,
					set: {
						name: activity.name,
						distance: activity.distance,
						movingTime: activity.moving_time,
						elapsedTime: activity.elapsed_time,
						totalElevationGain: activity.total_elevation_gain,
						averageSpeed: activity.average_speed,
						maxSpeed: activity.max_speed,
						averageHeartrate: activity.average_heartrate ?? null,
						maxHeartrate: activity.max_heartrate ?? null,
						summaryPolyline: activity.map?.summary_polyline ?? null,
						startLatlng: activity.start_latlng
							? `${activity.start_latlng[0]},${activity.start_latlng[1]}`
							: null,
					},
				});
			totalSynced++;
		}

		if (stravaActivities.length < 100) {
			hasMore = false;
		}
		page++;
	}

	// Clean up activities deleted on Strava — only on full sync (we fetched everything)
	if (full && syncedStravaIds.length > 0) {
		const deleted = await db
			.delete(activities)
			.where(and(eq(activities.userId, user.id), notInArray(activities.stravaId, syncedStravaIds)))
			.returning({ id: activities.id });
		if (deleted.length > 0) {
			console.log(
				`[Scheduler] Cleaned up ${deleted.length} deleted activities for user ${user.id} (${user.username})`,
			);
		}
	}

	await db
		.update(users)
		.set({ lastSyncedAt: syncStartedAt, updatedAt: new Date() })
		.where(eq(users.id, user.id));

	return totalSynced;
}

async function syncAllUsers(options: { full?: boolean } = {}): Promise<void> {
	const full = options.full ?? false;
	console.log(`[Scheduler] Starting ${full ? "full" : "incremental"} sync for all users`);
	const allUsers = await db
		.select({
			id: users.id,
			username: users.username,
			accessToken: users.accessToken,
			refreshToken: users.refreshToken,
			tokenExpiresAt: users.tokenExpiresAt,
			lastSyncedAt: users.lastSyncedAt,
		})
		.from(users);

	console.log(`[Scheduler] Found ${allUsers.length} users to sync`);

	for (const user of allUsers) {
		try {
			const synced = await syncUserActivities(user, { full });
			console.log(`[Scheduler] Synced ${synced} activities for user ${user.id} (${user.username})`);
		} catch (error) {
			console.error(`[Scheduler] Error syncing user ${user.id} (${user.username}):`, error);
		}
		// Wait 1 second between users to respect Strava rate limits
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	try {
		await checkOvertaking();
	} catch (error) {
		console.error("[Scheduler] Error checking overtaking:", error);
	}

	console.log("[Scheduler] Sync completed");
}

export function startScheduler(): void {
	// Incremental sync every 30 minutes (uses `after` param to fetch only new activities)
	cron.schedule("*/30 * * * *", () => {
		syncAllUsers({ full: false }).catch((error) => {
			console.error("[Scheduler] Unhandled error in incremental sync job:", error);
		});
	});

	// Full sync once a day at 03:00 (also detects deleted activities)
	cron.schedule("0 3 * * *", () => {
		syncAllUsers({ full: true }).catch((error) => {
			console.error("[Scheduler] Unhandled error in full sync job:", error);
		});
	});

	console.log("[Scheduler] Sync scheduler started (incremental every 30min, full daily at 03:00)");
}
