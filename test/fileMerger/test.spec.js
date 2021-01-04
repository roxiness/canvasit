const test = require('ava').default
const { merge } = require('../../templater')
const { readFileSync, emptyDirSync } = require('fs-extra')

test('files are copied and patched', t => {    
    const combos = ['base', 'overwrite', 'overwrite-and-patch', 'patch']
    const output = __dirname + '/output'
    emptyDirSync(output)

    merge( __dirname+'/fragments', combos, output )



    const content = readFileSync(__dirname+'/output/to-be-overwritten-and-patched.js', 'utf-8')
    t.is(content, 'module.exports.placeholder10 = 10\n\n'+
    'module.exports.placeholder15 = 15\n\n'+
    
    'module.exports.default = `I\'m overwritten`\n\n'+
    
    'module.exports.placeholder20 = 20\n')
})