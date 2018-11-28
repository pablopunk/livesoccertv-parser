const test = require('myass')
const fs = require('fs')
const moment = require('moment')
const m = require('../index') // dont import built code - can help when getting errors on tests

const basicTest = async (t, country, team) => {
  const matches = await m.matches(country, team)
  t.true(Array.isArray(matches))
  t.true(matches.length > 0)

  return matches
}

const classificationTest = async (t, country, competition) => {
  const matches = await m.classification(country, competition)
  t.true(Array.isArray(matches))
  t.true(matches.length > 0)

  return matches
}

const logoTest = async (t, country, team, path) => {
  const matches = m.logo(country, team, {},path)
    .then(() => {
      t.true(Array.isArray(matches))
      t.true(matches.length > 0)

      return matches
    })
    .catch(() => { })
}

test('Test Clasificacion Primera Division', async t => {
  await classificationTest(t, 'spain', 'primera-division')
})

test('Test Download Logo', async t => {
  await logoTest(t, 'spain', 'real-madrid', './test/')
})

test('Test Real Madrid', async t => {
  await basicTest(t, 'spain', 'real-madrid')
})

test('Test Barcelona', async t => {
  await basicTest(t, 'spain', 'barcelona')
})

test('Test timezones', async t => {
  const inEngland = await m.matches('england', 'arsenal', { timezone: 'Europe/Madrid' })
  const inSpain = await m.matches('england', 'arsenal', { timezone: 'Europe/Moscow' })
  const timeInSpain = moment(inSpain[0].time, 'LT')
  const timeInEnglad = moment(inEngland[0].time, 'LT')
  const diff = timeInSpain.diff(timeInEnglad, 'hours')
  t.is(diff, 2)
})

test('Static html', async t => {
  const html = fs.readFileSync('./test/real-madrid.html').toString()
  const matches = m.parseMatchesFromHtml(html)
  const results = require('./real-madrid.json')

  t.is(matches, results)
})
