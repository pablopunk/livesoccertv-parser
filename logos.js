const { get } = require('got')
const moment = require('moment')
const cheerio = require('cheerio')
const cityTimezones = require('city-timezones')
const fs = require('fs')
const request = require('request')

require('moment-timezone')
const DEFAULT_TIMEZONE = 'America/New_York'
moment.tz.setDefault(DEFAULT_TIMEZONE)

let $

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

const parseLogo = n =>
  $('td[width="100"]').children('img').eq(0).attr('src')

class Logos {
  constructor(n) {
    this.logo = parseLogo(n)
  }
}

const parseLogoFromHtml = (body) => {
  $ = cheerio.load(body)
  let matches = new Logos()

  return 'http:' + matches.logo
}

const download = (uri, filename, callback) => {
  request.head(uri, (err) => {
    if (err) { return }
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
  })
}

module.exports.donwloadLogos = async (country, team, options, path) => {
  const timezone = options.timezone || DEFAULT_TIMEZONE
  const body = await getBody({ country, team, timezone })
  const matches = parseLogoFromHtml(body, timezone)
  download(matches, path + team + '.png', () => { })
}

module.exports.parseLogoFromHtml = parseLogoFromHtml