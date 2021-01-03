const test = require('ava').default
const { mergeFiles } = require('../../lib/fileMerger')
const { readFileSync, emptyDirSync } = require('fs-extra')

test('files are copied and patched', t => {    
    const folders = ['base', 'overwrite', 'overwrite-and-patch', 'patch']
        .map(name => `${__dirname}/fragments/${name}`)
    const configs = {}
    const output = __dirname + '/output'
    emptyDirSync(output)

    mergeFiles({ folders, configs, output })

    const content = readFileSync(__dirname+'/output/to-be-overwritten-and-patched.js', 'utf-8')
    t.is(content, 'module.exports.placeholder10 = 10\n\n'+
    'module.exports.placeholder15 = 15\n\n'+
    
    'module.exports.default = `I\'m overwritten`\n\n'+
    
    'module.exports.placeholder20 = 20\n')
})