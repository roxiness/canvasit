const test = require('ava').default
const { merge } = require('../../canvasit')
const { readFileSync, emptyDirSync } = require('fs-extra')

test('configs are written correctly', async t => {    
    emptyDirSync(__dirname + '/output')
    const dir = __dirname + '/output'
    await merge([__dirname + '/fragments/base'], dir)

    t.is(
        readFileSync(dir + '/myconfig.js', 'utf8'),
        readFileSync(__dirname + '/expect.js', 'utf8')
    )
})