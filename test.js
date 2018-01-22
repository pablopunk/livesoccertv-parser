import test from 'ava'
import moment from 'moment'
import m from './index' // import not built code can help when getting errors on tests

const basicTest = async (t, country, team) => {
  const matches = await m(country, team)
  t.true(Array.isArray(matches))
  t.true(matches.length > 0)
}

test('Test Real Madrid', async t => {
  await basicTest(t, 'spain', 'real-madrid')
})

test('Test Barcelona', async t => {
  await basicTest(t, 'spain', 'barcelona')
})

test('Test with timezone', async t => {
  const matches1 = await m('england', 'arsenal')
  const matches2 = await m('england', 'arsenal', { timezone: 'America/New_York' })
  const time1 = moment(matches1[0].time, 'LT')
  const time2 = moment(matches2[0].time, 'LT')
  const diff = time1.diff(time2, 'hours')
  t.is(diff, 6)
})
