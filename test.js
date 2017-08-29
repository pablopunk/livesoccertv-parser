const test = require('ava')
const m = require('.')

test('It works with basic parameters', async t => {
  const matches = await m('spain', 'real-madrid')
  t.true(matches.length > 0)
})
