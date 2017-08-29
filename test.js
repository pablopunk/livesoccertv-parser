const test = require('ava')
const m = require('.')

test('simple test', async t => {
  const matches = await m('spain', 'real-madrid')
		console.log(matches)
	t.true(matches.length > 0)
})
