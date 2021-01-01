const test = require('ava').default
const { merge } = require('../../templater')
const { emptyDirSync, readdirSync, readFileSync } = require('fs-extra')

test('realworld', t => {
  emptyDirSync(__dirname + '/output')

  const res = merge(__dirname + '/fragments', ['app', 'rollup', 'svelte', 'routify'], __dirname + '/output')

  // TODO
  t.assert('TODO')
})