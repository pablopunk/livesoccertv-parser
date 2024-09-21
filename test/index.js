const test = require("myass");
const fs = require("fs");
const moment = require("moment");
const m = require("../index"); // dont import built code - can help when getting errors on tests

const sortArray = (search) => {
	return search.sort((a, b) => `${a[0]}/${a[1]}`.localeCompare(`${b[0]}/${b[1]}`));
};

const basicTest = async (t, country, team) => {
	const matches = await m.getMatches(country, team);
	t.true(Array.isArray(matches));
	t.true(matches.length > 0);

	return matches;
};

test("Test Real Madrid", async (t) => {
	await basicTest(t, "spain", "real-madrid");
});

test("Test Barcelona", async (t) => {
	await basicTest(t, "spain", "barcelona");
});

test("Unknown country/team/timezone does not throw", async (t) => {
	const matches = await m.getMatches("foo", "bar", { timezone: "foo/bar" });
	t.is(matches, []);
});

test("Test timezones", async (t) => {
	const inEngland = await m.getMatches("england", "arsenal", {
		timezone: "Europe/Madrid",
	});
	const inSpain = await m.getMatches("england", "arsenal", {
		timezone: "Europe/London",
	});
	const timeInSpain = moment(inSpain[0].time, "LT");
	const timeInEngland = moment(inEngland[0].time, "LT");
	const diff = timeInSpain.diff(timeInEngland, "hours");
	t.is(diff, -1);
});

test("Test search", async (t) => {
	const search = await m.searchTeams("madrid");
	const sortedSearch = sortArray(search);
	const sortedExpected = sortArray([
		["spain", "real-madrid"],
		["spain", "atletico-madrid"],
	]);
	t.is(sortedSearch, sortedExpected);
});

test("Test empty search", async (t) => {
	const search = await m.searchTeams("skhjakhjfadkjsafdkhj");
	t.is(search, []);
});

test("Static html", async (t) => {
	const html = fs.readFileSync("./test/real-madrid.html").toString();
	const matches = m.parseMatchesFromHtml(html);
	const results = require("./real-madrid.json");

	t.is(matches, results);
});
