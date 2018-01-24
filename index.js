const fetch = require('isomorphic-fetch')
const moment = require('moment')
const microfetch = require('microfetch')(fetch)
const cheerio = require('cheerio')
require('moment-timezone')
moment.tz.setDefault('America/New_York')

let $ // cheerio will be initialized with the html body

const baseUrl = 'http://www.livesoccertv.com/teams'

let timezone = 'Europe/Madrid'
// To get the right tv channels
let Cookie

const getBody = async url => {
  switch (timezone) {
    case 'Europe/Madrid':
      Cookie =
        'live=live; u_scores=on; u_continent=Europe; u_country=Spain; u_country_code=ES; u_timezone=Europe%2FMadrid; u_lang=es; u_locale=en_ES;'
      break
    case 'Europe/London':
      Cookie =
        'live=live; u_scores=on; u_continent=Europe; u_country=England; u_country_code=UK; u_timezone=Europe%2FLondon; u_lang=en; u_locale=en_UK;'
      break
    case 'America/New_York':
      Cookie =
        'live=live; u_scores=on; u_continent=North+America; u_country=USA; u_country_code=US; u_timezone=America%2FNew_York; u_lang=en; u_locale=en_US;'
      break
    default:
      Cookie =
        'live=live; u_scores=on; u_continent=Europe; u_country=Spain; u_country_code=ES; u_timezone=Europe%2FMadrid; u_lang=es; u_locale=en_ES;'
      break
  }
  const headers = {Cookie}

  return (await microfetch(url, {headers})).text()
}
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`

const adjustLocalTime = (time, timezone) =>
  moment(time, 'hh:mm')
    .clone()
    .tz(timezone)
    .format('LT')

const parseLive = n =>
  $('tr.matchrow > td.livecell > span')
    .eq(n)
    .attr('class') === 'narrow live'
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
    this.live = parseLive(n)
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
  if (options.timezone) {
    timezone = options.timezone
  }
  const body = await getBody(getTeamUrl(country, team))
  let matches = parseMatches(body)

  matches = convertObjectsToArray(matches)
  matches = matches.filter(m => m.time !== 'Invalid date' && m.tvs.length !== 0)

  matches = matches.map(m => ({
    ...m,
    time: adjustLocalTime(m.time, timezone)
  }))

  return matches
}
