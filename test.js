import test from 'ava'
import moment from 'moment'
import m from './index' // import not built code can help when getting errors on tests

const basicTest = async (t, country, team) => {
  const matches = await m(country, team)
  t.true(Array.isArray(matches))
  t.true(matches.length > 0)

  return matches
}

test('Test Real Madrid', async t => {
  await basicTest(t, 'spain', 'real-madrid')
})

test('Test Barcelona', async t => {
  await basicTest(t, 'spain', 'barcelona')
})

test('Test timezones', async t => {
  const matches1 = await m('england', 'arsenal') // Default is America/New_York
  const matches2 = await m('england', 'arsenal', { timezone: 'Europe/Madrid' })
  const matches3 = await m('england', 'arsenal', { timezone: 'Europe/Moscow' })
  const time1 = moment(matches1[0].time, 'LT')
  const time2 = moment(matches2[0].time, 'LT')
  const time3 = moment(matches3[0].time, 'LT')
  const diff1 = time1.diff(time2, 'hours')
  const diff2 = time1.diff(time3, 'hours')
  t.is(diff1, -6)
  t.is(diff2, -7)
})
