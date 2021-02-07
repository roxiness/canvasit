const test = require('ava').default
const { merge } = require('../../canvasit')

test('adds dependencies', async t => {
    const res = await merge(['base'], 'output', { basepath: __dirname + '/fragments', prettier: false })
    t.assert(res.configs.dep)
})

test('two fragments can share same dependency', async t => {
    const res = await merge(['base', 'base2'], 'output', { basepath: __dirname + '/fragments', prettier: false })    
    t.is(res.fragments.length, 3)
})