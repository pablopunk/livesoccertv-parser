import test from 'ava'
import m from './index' // import not built code can help when getting errors on tests

test('It works with basic parameters', async t => {
  const matches = await m('spain', 'real-madrid')
  t.true(Array.isArray(matches))
  t.true(matches.length > 0)
})
