declare module "livesoccertv-parser" {
	interface Match {
		live: boolean;
		played: boolean;
		competition: string;
		date: string;
		time: string;
		game: string;
		tvs: string[];
	}

	interface MatchesOptions {
		timezone?: string;
	}

	/**
	 * Fetches matches for a specific country and team, with optional parameters.
	 * @param country - The country to get matches for (e.g., 'spain').
	 * @param team - The team to get matches for (e.g., 'real-madrid').
	 * @param options - Optional parameters like timezone.
	 * @returns A promise that resolves to an array of Match objects.
	 */
	function matches(
		country: string,
		team: string,
		options?: MatchesOptions,
	): Promise<Match[]>;

	export default matches;
}
