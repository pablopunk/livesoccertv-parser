import test from 'ava'
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
