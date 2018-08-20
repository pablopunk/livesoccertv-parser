const {get} = require('got')
const moment = require('moment')
const cheerio = require('cheerio')
const cityTimezones = require('city-timezones')

require('moment-timezone')
const DEFAULT_TIMEZONE = 'America/New_York'
moment.tz.setDefault(DEFAULT_TIMEZONE)

let $ // cheerio will be initialized with the html body

let baseUrl = 'http://www.livesoccertv.com/teams'

const splitTimezone = tz => tz.split('/')
const urlifyTimezone = tz => tz.replace('/', '%2F')
const getCountry = (city, tz) => {
  const cities = cityTimezones.lookupViaCity(city)
  for (const c of cities) {
    if (c.timezone === tz) {
      return c
    }
  }
  return cities[0]
}

const getBody = async (url, timezone) => {
  const [continent, city] = splitTimezone(timezone)
  let {iso3: countryCode, iso2: lang} = getCountry(city.replace('_', ' '), timezone)
  lang = lang.toLowerCase()
  if (lang === 'us' || lang === 'gb') {
    lang = 'en'
  }
  if (countryCode === 'GBR') {
    countryCode = 'UK'
    lang = 'en'
  }
  const locale = `${lang}_${countryCode}`

  const Cookie = `live=live; u_scores=on; u_continent=${continent}; u_country=${countryCode}; u_country_code=${countryCode}; u_timezone=${urlifyTimezone(timezone)}; u_lang=${lang}; u_locale=${locale}`
  const headers = {
    'Cache-Control': 'max-age=0',
    Cookie
  }

  return (await get(url, {headers})).body
}
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`

const adjustLocalTime = (time, timezone) =>
  moment(time, 'hh:mm')
    .clone()
    .tz(timezone)
    .format('LT')

const parseLive = n => {
  const el1 = $('tr.matchrow > td.timecell > span.ftime > span.ts').eq(n)
  const el2 = $('tr.matchrow > td.timecell > span.ftime > span.inprogress').eq(n)
  if (el1.attr('class') === 'ts started' && el2.attr('class') === 'inprogress') {
    return true
  }
  return false
}
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
const parseTime = n =>
  $('tr.matchrow > td.timecell')
    .eq(n)
    .find('span')
    .eq(2)
    .text()
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
  const timezone = options.timezone || DEFAULT_TIMEZONE
  const body = await getBody(getTeamUrl(country, team), timezone)
  let matches = parseMatches(body)

  matches = convertObjectsToArray(matches)
  matches = matches.filter(m => m.time !== 'Invalid date' && m.tvs.length !== 0)

  matches = matches.map(m => ({
    ...m,
    time: adjustLocalTime(m.time, timezone)
  }))

  return matches
}
