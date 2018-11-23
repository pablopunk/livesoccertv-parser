const { get } = require('got');
const moment = require('moment');
const cheerio = require('cheerio');
const cityTimezones = require('city-timezones');

require('moment-timezone')
const DEFAULT_TIMEZONE = 'America/New_York'
moment.tz.setDefault(DEFAULT_TIMEZONE)

let $

let baseUrl = 'http://www.livesoccertv.com/competitions'

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

const getBody = async ({ country, competition, timezone }) => {
  const url = getTeamUrl(country, competition)
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
const getTeamUrl = (country, team) => {
  return `${baseUrl}/${country}/${team}`
}
const parseClassification = n => {
  teams = [];
  position = 1;
  $('td.medium')
    .next().children('a')
    .each((i, item) => {
      if ($(item).text() !== '') {
        teams.push({
          pos: position,
          team: $(item).text(),
          pj: $(item).parent().next().text(),
          pg: $('td.medium').next().next().next().text()[position-1],
          pe: $('td.medium').next().next().next().next().text()[position-1],
          pp: $(item).parent().next().next().next().next().text(),
          gf: $(item).parent().next().next().next().next().next().text(),
          gc: $(item).parent().next().next().next().next().next().next().text(),
          diff: $(item).parent().next().next().next().next().next().next().next().text(),
          points: $(item).parent().next().next().next().next().next().next().next().next().text()
        })
        position++;
      }
    })

  return teams;
}

class Classification {
  constructor(n) {
    this.classification = parseClassification(n)
  }
}

const parseClassificationFromHtml = (body, timezone = DEFAULT_TIMEZONE) => {
  $ = cheerio.load(body)
  let classification = new Classification();
  return classification
}

// Comandos exportados

module.exports.classification = async (country, competition, options = {}) => {
  const timezone = options.timezone || DEFAULT_TIMEZONE
  const body = await getBody({ country, competition, timezone })
  const teams = parseClassificationFromHtml(body, timezone)
  return teams.classification
}

module.exports.parseClassificationFromHtml = parseClassificationFromHtml