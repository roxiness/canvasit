const test = require('ava').default
const { merge } = require('../../canvasit')
const { emptyDirSync, readdirSync, readFileSync } = require('fs-extra')

test('templates are written correctly', async t => {
    emptyDirSync(__dirname + '/output')

    await merge([__dirname + '/fragments/base'], __dirname + '/output')

    const files = readdirSync(__dirname + '/output')
    t.deepEqual(files, ['a-dir', 'a-file.txt', 'app.config.js'])

    const file = readFileSync(__dirname + '/output/app.config.js', 'utf8')
    t.is(file, 
`import 'moduleA'
import 'moduleB'

export default {
  bool: true,
  fn: aFakeFunction('oot'),
  compiled: {
    literal: ['foo', 'bar'],
    literalArray: ['foo', 'bar'],
    actualArray: ['thing one', 'thing two'],
  },
}
`)
})