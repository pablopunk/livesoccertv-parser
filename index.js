const { get } = require('got')
const moment = require('moment')
const cheerio = require('cheerio')
const cityTimezones = require('city-timezones')
const logos = require('./logos')
const classification = require('./classification')

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

const badCountryCodes = {
  'ESP': 'ES',
  'USA': 'US',
  'GBR': 'UK',
  'RUS': 'RU'
}

const badLangCodes = {
  'us': 'en',
  'gb': 'en'
}

const fixCountryCode = (country) => {
  for (const bad in badCountryCodes) {
    country = country.replace(bad, badCountryCodes[bad])
  }

  return country
}

const fixLangCode = (lang) => {
  for (const bad in badLangCodes) {
    lang = lang.replace(bad, badLangCodes[bad])
  }

  return lang
}

const getBody = async ({ country, team, timezone }) => {
  const url = getTeamUrl(country, team)
  const [continent, city] = splitTimezone(timezone)
  let { iso3: countryCode, iso2: lang } = getCountry(city.replace('_', ' '), timezone)
  lang = lang.toLowerCase()
  lang = fixLangCode(lang)
  countryCode = fixCountryCode(countryCode)
  const locale = `${lang}_${countryCode}`

  const Cookie = `live=live; u_scores=on; u_continent=${continent}; u_country=${country}; u_country_code=${countryCode}; u_timezone=${urlifyTimezone(timezone)}; u_lang=${lang}; u_locale=${locale}`
  const headers = { Cookie }

  return (await get(url, { headers })).body
}
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`

const adjustLocalTime = (time, timezone) =>
  moment(time, 'hh:mm')
    .clone()
    .tz(timezone)
    .format('LT')

const parseLive = n =>
  $('tr.matchrow')
    .eq(n)
    .attr('class')
    .includes('livematch')
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

const parseMatchesFromHtml = (body, timezone = DEFAULT_TIMEZONE) => {
  $ = cheerio.load(body)
  const matchRows = $('tr.matchrow')

  let matches = matchRows.map(i => new Match(i))
  matches = convertObjectsToArray(matches)
  matches = matches.filter(m => m.time !== 'Invalid date' && m.tvs.length !== 0)

  matches = matches.map(m => ({
    ...m,
    time: adjustLocalTime(m.time, timezone)
  }))

  return matches
}

module.exports.matches = async (country, team, options = {}) => {
  const timezone = options.timezone || DEFAULT_TIMEZONE
  const body = await getBody({ country, team, timezone })
  const matches = parseMatchesFromHtml(body, timezone)
  return matches
}

module.exports.logo = async (country, team, options = {}, path) => {
  const timezone = options.timezone || DEFAULT_TIMEZONE
  return logos.donwloadLogos(country, team, timezone, path)
}

module.exports.classification = async (country, team, options = {}) => {
  const timezone = options.timezone || DEFAULT_TIMEZONE
  return classification.classification(country, team, timezone)
}

module.exports.parseMatchesFromHtml = parseMatchesFromHtml
