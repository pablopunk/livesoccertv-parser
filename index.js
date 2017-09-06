const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')

const baseUrl = 'http://www.livesoccertv.com/teams'

const ROW = {
  'played': 0,
  'competition': 1,
  'date': 2,
  'time': 3,
  'game': 4,
  'tvs': 5
}

const getBody = async url => (await fetch(url)).text()
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`
const getMatchRows = $ => $('tr.matchrow')
const objIsNotText = a => a.type !== 'text'

const getCell = (row, field) => row.children.filter(objIsNotText)[ROW[field]]
const getTitleFromRow = (row, field, n = 0) => getCell(row, field).children.filter(objIsNotText)[n].attribs.title

const parsePlayed = row => (getCell(row, 'played').children.filter(objIsNotText)[0].attribs.class === 'narrow ft')
const parseCompetition = row => getTitleFromRow(row, 'competition')
const parseDate = row => getCell(row, 'date').children.filter(objIsNotText)[0].children[1].children[0].data
const parseTime = row => getCell(row, 'time').children[1].children[0].children[0].data
const parseGame = row => getTitleFromRow(row, 'game')
const parseTvs = row => getCell(row, 'tvs').children.filter(objIsNotText).map((r, i) => getTitleFromRow(row, 'tvs', i))

const filterTvs = tv => tv !== 'More channels'
const removeEspana = tvs => tvs.map(c => c.replace(/ *espa.a/i, ''))

const convertObjectsToArray = objects => {
  let array = []
  objects.map((i, o) => array.push(o))
  return array
}

class Match {
  constructor (row) {
    this.played = parsePlayed(row)
    this.competition = parseCompetition(row)
    this.date = parseDate(row)
    this.time = parseTime(row)
    this.game = parseGame(row)
    this.tvs = parseTvs(row)
    this.tvs = removeEspana(this.tvs)
    this.tvs = this.tvs.filter(filterTvs)
  }
}

const parseMatches = body => {
  const $ = cheerio.load(body)
  let matchRows = getMatchRows($)
  return matchRows.map((i, r) => (new Match(r)))
}

module.exports = async (country, team) => {
  const body = await getBody(getTeamUrl(country, team))
  let matches = parseMatches(body)
  matches = convertObjectsToArray(matches)
  return matches
}
