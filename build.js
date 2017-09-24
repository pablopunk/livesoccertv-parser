'use strict'

function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function') } }

var fetch = require('isomorphic-fetch')
var microfetch = require('microfetch')(fetch)
var cheerio = require('cheerio')
var moment = require('moment')

var baseUrl = 'http://www.livesoccertv.com/es/teams'
var headers = {
  'Accept-Language': 'es-ES,es;q=0.8,en;q=0.6,gl;q=0.4',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.45 Safari/535.19'

  // @TODO: Customize time format and time zone    const ROW = {
}; moment.locale('es')
var adjustLocalTime = function adjustLocalTime (time) {
  return moment(time, 'hh:mm').add(6, 'hour').format('LT')
}

var ROW = {
  'played': 0,
  'competition': 1,
  'date': 2,
  'time': 3,
  'game': 4,
  'tvs': 5
}

var getBody = async function getBody (url) {
  return (await microfetch(url, { headers: headers })).text()
}
var getTeamUrl = function getTeamUrl (country, team) {
  return baseUrl + '/' + country + '/' + team
}
var getMatchRows = function getMatchRows ($) {
  return $('tr.matchrow')
}
var objIsNotText = function objIsNotText (a) {
  return a.type !== 'text'
}

var getCell = function getCell (row, field) {
  return row.children.filter(objIsNotText)[ROW[field]]
}
var getTitleFromRow = function getTitleFromRow (row, field) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0
  return getCell(row, field).children.filter(objIsNotText)[n].attribs.title
}

var parsePlayed = function parsePlayed (row) {
  return getCell(row, 'played').children.filter(objIsNotText)[0].attribs.class === 'narrow ft'
}
var parseCompetition = function parseCompetition (row) {
  return getTitleFromRow(row, 'competition')
}
var parseDate = function parseDate (row) {
  return getCell(row, 'date').children.filter(objIsNotText)[0].children[1].children[0].data
}
var parseTime = function parseTime (row) {
  return getCell(row, 'time').children[1].children[0].children[0].data
}
var parseGame = function parseGame (row) {
  return getTitleFromRow(row, 'game')
}
var parseTvs = function parseTvs (row) {
  return getCell(row, 'tvs').children.filter(objIsNotText).map(function (r, i) {
    return getTitleFromRow(row, 'tvs', i)
  })
}

var filterTvs = function filterTvs (tv) {
  return tv !== 'More channels'
}
var removeEspana = function removeEspana (tvs) {
  return tvs.map(function (c) {
    return c.replace(/ *espa.a/i, '')
  })
}

var convertObjectsToArray = function convertObjectsToArray (objects) {
  var array = []
  objects.map(function (i, o) {
    return array.push(o)
  })
  return array
}

var Match = function Match (row) {
  _classCallCheck(this, Match)

  this.played = parsePlayed(row)
  this.competition = parseCompetition(row)
  this.date = parseDate(row)
  this.time = adjustLocalTime(parseTime(row))
  this.game = parseGame(row)
  this.tvs = parseTvs(row)
  this.tvs = removeEspana(this.tvs)
  this.tvs = this.tvs.filter(filterTvs)
}

var parseMatches = function parseMatches (body) {
  var $ = cheerio.load(body)
  var matchRows = getMatchRows($)
  return matchRows.map(function (i, r) {
    return new Match(r)
  })
}

module.exports = async function (country, team) {
  var body = await getBody(getTeamUrl(country, team))
  var matches = parseMatches(body)
  matches = convertObjectsToArray(matches)
  return matches
}
