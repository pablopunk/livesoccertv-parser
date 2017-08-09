const got = require('got')
const cheerio = require('cheerio')

const baseUrl = 'http://www.livesoccertv.com/teams'

const matchRowType = {
  'finished': 0,
  'competition': 1,
  'date': 2,
  'time': 3,
  'match': 4,
  'channels': 5
}

const getBody = async url => (await got(url)).body
const getTeamUrl = (country, team) => `${baseUrl}/${country}/${team}`
const getMatchRows = $ => $('tr.matchrow')
const objIsNotText = a => a.type != 'text'

const handleBody = body => {
  const $ = cheerio.load(body)
  const matchRows = getMatchRows($)
  console.log(
    matchRows[0]
    .children
    .filter(objIsNotText)[matchRowType['match']]
    .children
    .filter(objIsNotText)[0]
    .attribs
    .title
  )
}

getBody(getTeamUrl('spain', 'real-madrid')).then(handleBody)

