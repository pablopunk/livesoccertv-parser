const test = require('ava')
const m = require('.')

test('It works with basic parameters', async t => {
  const matches = await m('spain', 'real-madrid')
  console.log(matches)
  t.true(matches.length > 0)
})
