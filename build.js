'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fetch = require('isomorphic-fetch');
var cheerio = require('cheerio');

var baseUrl = 'http://www.livesoccertv.com/teams';

var matchRowType = {
  'played': 0,
  'competition': 1,
  'date': 2,
  'time': 3,
  'game': 4,
  'tvs': 5
};

var getBody = async function getBody(url) {
  return (await fetch(url)).text();
};
var getTeamUrl = function getTeamUrl(country, team) {
  return baseUrl + '/' + country + '/' + team;
};
var getMatchRows = function getMatchRows($) {
  return $('tr.matchrow');
};
var objIsNotText = function objIsNotText(a) {
  return a.type !== 'text';
};

var getTitleFromRow = function getTitleFromRow(row, field) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return row.children.filter(objIsNotText)[matchRowType[field]].children.filter(objIsNotText)[n].attribs.title;
};

var parsePlayed = function parsePlayed(row) {
  return getTitleFromRow(row, 'played') === 'Match ended';
};
var parseCompetition = function parseCompetition(row) {
  return getTitleFromRow(row, 'competition');
};
var parseDate = function parseDate(row) {
  return getTitleFromRow(row, 'date').replace('Schedule for ', '');
};
// const parseTime = row => row.children.filter(objIsNotText)[matchRowType['time']].children[1].children[0].children[0].data
var parseTime = function parseTime(row) {
  return row.children.filter(objIsNotText)[matchRowType['time']].children[1].children[0];
};
var parseGame = function parseGame(row) {
  return getTitleFromRow(row, 'game');
};
var parseTvs = function parseTvs(row) {
  return row.children.filter(objIsNotText)[matchRowType['tvs']].children.filter(objIsNotText).map(function (r, i) {
    return getTitleFromRow(row, 'tvs', i);
  });
};

var filterTvs = function filterTvs(tv) {
  return tv !== 'More channels';
};
var removeEspana = function removeEspana(tvs) {
  return tvs.map(function (c) {
    return c.replace('Espana', '');
  });
};

var convertObjectsToArray = function convertObjectsToArray(objects) {
  var array = [];
  objects.map(function (i, o) {
    return array.push(o);
  });
  return array;
};

var Match = function Match(row) {
  _classCallCheck(this, Match);

  this.played = parsePlayed(row);
  this.competition = parseCompetition(row);
  this.date = parseDate(row);
  this.time = parseTime(row);
  this.game = parseGame(row);
  this.tvs = parseTvs(row);
  this.tvs = removeEspana(this.tvs);
  this.tvs = this.tvs.filter(filterTvs);
};

var parseMatches = function parseMatches(body) {
  var $ = cheerio.load(body);
  var matchRows = getMatchRows($);
  matchRows = [matchRows[5]];
  return matchRows.map(function (i, r) {
    return new Match(r);
  });
};

module.exports = async function (country, team) {
  var body = await getBody(getTeamUrl(country, team));
  var matches = parseMatches(body);
  matches = convertObjectsToArray(matches);
  return matches;
};
