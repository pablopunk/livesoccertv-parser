const test = require('ava')
const m = require('.')

test('It works with basic parameters', async t => {
  const matches = await m('spain', 'real-madrid')
  t.true(Array.isArray(matches))
  t.true(matches.length > 0)
})
