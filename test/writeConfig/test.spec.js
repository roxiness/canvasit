const test = require('ava').default
const { merge } = require('../../templater')
const { readFileSync, emptyDirSync } = require('fs-extra')

test('configs are written correctly', t => {    
    emptyDirSync(__dirname + '/output')
    const dir = __dirname + '/output'
    const res = merge(__dirname + '/fragments', ['base'], dir)

    t.is(
        readFileSync(dir + '/myconfig.js', 'utf8'),
        readFileSync(__dirname + '/expect.js', 'utf8')
    )
})