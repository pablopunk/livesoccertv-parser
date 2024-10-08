const moment = require('moment')
const cheerio = require('cheerio')
const cityTimezones = require('city-timezones')

require('moment-timezone')
const DEFAULT_TIMEZONE = 'America/New_York'
// biome-ignore lint/complexity/useOptionalChain: <explanation>
if (moment.tz && moment.tz.setDefault) {
  moment.tz.setDefault(DEFAULT_TIMEZONE)
}

let $ // cheerio will be initialized with the html body

const baseUrl = 'https://www.livesoccertv.com/teams'

const splitTimezone = (tz) => tz.split('/')
const urlifyTimezone = (tz) => tz.replace('/', '%2F')
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
  ESP: 'ES',
  USA: 'US',
  GBR: 'UK',
  RUS: 'RU',
}

const badLangCodes = {
  us: 'en',
  gb: 'en',
}

const fixCountryCode = (_country) => {
  let country = _country
  for (const bad in badCountryCodes) {
    country = country.replace(bad, badCountryCodes[bad])
  }

  return country
}

const fixLangCode = (_lang) => {
  let lang = _lang
  for (const bad in badLangCodes) {
    lang = lang.replace(bad, badLangCodes[bad])
  }

  return lang
}

const getDataFromTimezone = (timezone) => {
  const [continent, city] = splitTimezone(timezone)
  const countryInfo = getCountry(city.replace('_', ' '), timezone)
  if (!countryInfo) {
    console.error('Unkown country/team/timezone', { timezone })
    return null
  }
  let countryCode = countryInfo.iso3
  let lang = countryInfo.iso2
  lang = lang.toLowerCase()
  lang = fixLangCode(lang)
  countryCode = fixCountryCode(countryCode)
  const locale = `${lang}_${countryCode}`
  const country = countryInfo.country

  return {
    countryCode,
    country,
    lang,
    locale,
    continent,
  }
}

const getBody = async ({ country, team, timezone }) => {
  const url = getTeamUrl(country, team)
  const timezoneData = getDataFromTimezone(timezone)
  const cookie = `u_country=${timezoneData.country}; u_country_code=${timezoneData.countryCode}; u_timezone=${urlifyTimezone(
    timezone,
  )}; live=live; u_scores=on; u_continent=${timezoneData.continent}; u_lang=${timezoneData.lang}; u_locale=${timezoneData.locale}; cf_clearance=bk.KgidKvvr6VwkqAS4WsVpC1q.BjwFWKTuSpLBRgJQ-1726529836-1.2.1.1-uhaLBvQThL5uZsG_4v6CKc8I6WZnh.Tc4U3LrQZyz7FKNFjQBJHQnegA63J1yTSNL5lHSLqQfAyFQHdlvhYBFHfylHYk4rLyhXA30xUvMtrrbfwuLWUAWoco2qzyUi8SPrikOZQEbAgETrm7WcyILiS7ZXWJqA_C.ws3Rw0WHtdbjQ8AmLL0j19J9D49vFD.f5KvYmJkk7Lf7jz9ywfY4oOxpJIF9ghs6EzldFQaDDJEkrLfy7eUuNQPTWJpKfyt6GTIpvdaEqVKFDql6V0VLWp1g2pXJpQ0vbb21shaMqBWZLPXB1Vot6Y1kI95rl4ekAmuMgTOb6JAIcs3F9hZtLYe.LJyD_9dfJrBs3x8KjV1kq0_Gjqx32EDxyJy2ZxNFXprn65.xJDoEtfHXHgqlA`

  const response = await fetch(url, {
    headers: {
      cookie,
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': `${timezoneData.lang}-${timezoneData.countryCode},${timezoneData.lang};q=0.9`,
      priority: 'u=0, i',
      'sec-ch-ua': '"Not;A=Brand";v="24", "Chromium";v="128"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    },
    body: null,
    method: 'GET',
  })

  return response.text()
}
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`

const adjustLocalTime = (time, timezone) => {
  const resultDate = moment(time, 'h:mm A').tz(timezone).format('HH:mm')
  return resultDate !== 'Invalid date' ? resultDate : time
}

const parseLive = (n) => $('tr.matchrow').eq(n).hasClass('livematch')
const parsePlayed = (n) =>
  $('tr.matchrow').eq(n).find('.livecell').hasClass('ft')
const parseCompetition = (n) =>
  $('tr.matchrow').eq(n).prev('tr.drow').find('a').eq(1).text().trim()
const parseDate = (n) =>
  $('tr.matchrow').eq(n).prev('tr.drow').find('a').eq(0).text().trim()
const parseTime = (n) =>
  $('tr.matchrow').eq(n).find('.timecell span').eq(0).text().trim()
const parseGame = (n) => $('tr.matchrow').eq(n).find('a').eq(0).text().trim()

const parseTvs = (n) => {
  const tvs = []
  $('tr.matchrow')
    .eq(n)
    .find('#channels a')
    .each((i, el) => {
      tvs.push($(el).text().trim())
    })
  return tvs
}

const filterTvs = (tv) => tv && !tv.includes('…')

const convertObjectsToArray = (objects) => {
  const array = []
  objects.map((i, o) => array.push(o))
  return array
}

class Match {
  constructor(n) {
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

  let matches = matchRows.map((i) => new Match(i))
  matches = convertObjectsToArray(matches)
  matches = matches.filter((m) => m.tvs.length !== 0)

  matches = matches.map((m) => ({
    ...m,
    time: adjustLocalTime(m.time, timezone),
  }))

  return matches
}

module.exports.getMatches = async (country, team, options = {}) => {
  try {
    const timezone = options.timezone || DEFAULT_TIMEZONE
    const body = await getBody({ country, team, timezone })
    const matches = parseMatchesFromHtml(body, timezone)

    return matches
  } catch (error) {
    console.error('Error fetching matches', { error })
    return []
  }
}

module.exports.searchTeams = async (query, options = {}) => {
  try {
    const timezone = options.timezone || DEFAULT_TIMEZONE
    const { lang, countryCode } = getDataFromTimezone(timezone)
    const url = `https://www.livesoccertv.com/es/include/autocomplete.php?search=${query}&s_type=instant&lang=${lang}&iso=${countryCode}`
    const response = await fetch(url)
    const body = await response.text()
    const $ = cheerio.load(body)
    const teams = $('a[href*="%2Fteams%2F"]')
      .map((i, el) => {
        const href = $(el).attr('href')
        const match = href.match(/%2Fteams%2F([^%]+%2F[^%]+)%2F/)
        return match ? decodeURIComponent(match[1]) : null
      })
      .get()
      .filter(Boolean)
      .map((team) => team.split('/'))
    return teams
  } catch (error) {
    console.error('Error searching teams', { error })
    return []
  }
}

// Exporting for testing
module.exports.parseMatchesFromHtml = parseMatchesFromHtml
module.exports.adjustLocalTime = adjustLocalTime
