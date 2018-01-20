const fetch = require('isomorphic-fetch')
const moment = require('moment')
const microfetch = require('microfetch')(fetch)
const cheerio = require('cheerio')
require('moment-timezone')
moment.tz.setDefault('America/New_York')

let $ // cheerio will be initialized with the html body

const baseUrl = 'http://www.livesoccertv.com/teams'

const getBody = async url => (await microfetch(url)).text()
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`

const adjustLocalTime = (time, timezone) =>
  moment(time, 'hh:mm')
    .clone()
    .tz(timezone)
    .format('hh:mm')

const parsePlayed = n =>
  $('tr.matchrow > td.livecell > span')
    .eq(n)
    .attr('class') === 'narrow ft'
const parseCompetition = n =>
  $('tr.matchrow > td.compcell > a')
    .eq(n)
    .attr('title')
const parseDate = n =>
  $('tr.matchrow > td.datecell > a > span')
    .eq(n)
    .text()
const parseTime = n => {
  return $('tr.matchrow > td.timecell')
    .eq(n)
    .find('span')
    .eq(2)
    .text()
}
const parseGame = n =>
  $('tr.matchrow > td.timecell')
    .next('td')
    .eq(n)
    .find('a')
    .text()

const parseTvs = n => {
  const tvs = []
  $('tr.matchrow > td[width="240"]')
    .eq(n)
    .find('a')
    .each((i, el) => {
      tvs.push($(el).text())
    })
  return tvs
}

const filterTvs = tv => tv && !tv.includes('…')

const convertObjectsToArray = objects => {
  const array = []
  objects.map((i, o) => array.push(o))
  return array
}

class Match {
  constructor (n) {
    this.played = parsePlayed(n)
    this.competition = parseCompetition(n)
    this.date = parseDate(n)
    this.time = parseTime(n)
    this.game = parseGame(n)
    this.tvs = parseTvs(n)
    this.tvs = this.tvs.filter(filterTvs)
  }
}

const parseMatches = body => {
  $ = cheerio.load(body)
  const matchRows = $('tr.matchrow')

  return matchRows.map(i => new Match(i))
}

module.exports = async (country, team, options = {}) => {
  const body = await getBody(getTeamUrl(country, team))
  let matches = parseMatches(body)

  matches = convertObjectsToArray(matches)
  matches = matches.filter(m => m.time !== 'Invalid date' && m.tvs.length !== 0)

  if (options.timezone) {
    matches = matches.map(m => ({
      ...m,
      time: adjustLocalTime(m.time, options.timezone)
    }))
  }

  return matches
}
