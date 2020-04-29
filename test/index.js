const test = require("myass");
const fs = require("fs");
const moment = require("moment");
const m = require("../index"); // dont import built code - can help when getting errors on tests

const basicTest = async (t, country, team) => {
  const matches = await m(country, team);
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

// TODO: Enable test after coronavirus
// test('Test timezones', async t => {
//   const inEngland = await m('england', 'arsenal', { timezone: 'Europe/Madrid' })
//   const inSpain = await m('england', 'arsenal', { timezone: 'Europe/London' })
//   const timeInSpain = moment(inSpain[0].time, 'LT')
//   const timeInEnglad = moment(inEngland[0].time, 'LT')
//   const diff = timeInSpain.diff(timeInEnglad, 'hours')
//   t.is(diff, -1)
// })

test("Static html", async (t) => {
  const html = fs.readFileSync("./test/real-madrid.html").toString();
  const matches = m.parseMatchesFromHtml(html);
  const results = require("./real-madrid.json");

  t.is(matches, results);
});
