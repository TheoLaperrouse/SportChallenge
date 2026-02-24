/**
 * Shared athlete color palette — used by charts and map
 * Colors are assigned deterministically by userId so the same athlete
 * always gets the same color regardless of data order.
 */
export const ATHLETE_COLORS = [
	"#F87171", // red-400
	"#60A5FA", // blue-400
	"#34D399", // emerald-400
	"#FBBF24", // yellow-400
	"#A78BFA", // violet-400
	"#FB923C", // orange-400
	"#22D3EE", // cyan-400
	"#F472B6", // pink-400
	"#818CF8", // indigo-400
	"#4ADE80", // green-400
	"#FCA5A5", // red-300
	"#93C5FD", // blue-300
	"#6EE7B7", // emerald-300
	"#FDE047", // yellow-300
	"#C4B5FD", // violet-300
	"#FCD34D", // amber-300
	"#67E8F9", // cyan-300
	"#F9A8D4", // pink-300
	"#A5B4FC", // indigo-300
	"#86EFAC", // green-300
];

export function getAthleteColor(userId: number): string {
	return ATHLETE_COLORS[userId % ATHLETE_COLORS.length];
}
