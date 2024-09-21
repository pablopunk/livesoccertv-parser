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
	function getMatches(
		country: string,
		team: string,
		options?: MatchesOptions
	): Promise<Match[]>;

	/**
	 * Searches for teams based on a query string.
	 * @param query - The search query.
	 * @param options - Optional parameters like timezone.
	 * @returns A promise that resolves to an array of [country, team] tuples.
	 */
	function searchTeams(
		query: string,
		options?: MatchesOptions
	): Promise<[string, string][]>;

	/**
	 * Parses matches from HTML content.
	 * @param body - The HTML content to parse.
	 * @param timezone - The timezone to use for parsing times.
	 * @returns An array of Match objects.
	 */
	function parseMatchesFromHtml(body: string, timezone?: string): Match[];

	export { getMatches, searchTeams, parseMatchesFromHtml };
}
