const fetch = require('isomorphic-fetch')
const microfetch = require('microfetch')(fetch)
const cheerio = require('cheerio')
const moment = require('moment')

let $ // cheerio will be initialized with the html body

const baseUrl = 'http://www.livesoccertv.com/teams'
const headers = {
  'Accept-Language': 'en-US,en;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.45 Safari/535.19',
  Cookie: 'u_lang=en, u_locale=en_US'
}

moment.locale('es')
const adjustLocalTime = time =>
  moment(time, 'hh:mm')
    .add(6, 'hour')
    .format('LT')

const getBody = async url => (await microfetch(url, { headers })).text()
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`

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
    this.time = adjustLocalTime(parseTime(n))
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

module.exports = async (country, team) => {
  const body = await getBody(getTeamUrl(country, team))
  let matches = parseMatches(body)
  matches = convertObjectsToArray(matches)
  return matches
}
