const { readFileSync, writeFileSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')
const { stringify } = require('./utils')
const { $require } = require('./blueprint/$require')
const { Template } = require('./Template.js')

/**
 * 
 * @param {string} filepath 
 * @param {string[]} folders 
 * @param {string} output 
 * @param {Object.<string, any>} configs 
 * @param {*} imports 
 */
async function patchFile(filepath, folders, output, configs, imports) {    
    const extensions = ['js', 'json', 'svelte', 'html']
    const patches = getPatches(filepath, folders, output)

    if (!patches.length && !extensions.includes(filepath.split('.').pop()))
        return false


    let content = readFileSync(filepath, 'utf-8')
    const placeholders = new Template(content, { filepath, imports })

    patches.forEach(patch => {
        try {
            patch.patch({ placeholders, configs, stringify, $require })
        } catch (err) {
            console.error(err)
            throw Error(`Could not use patch from "${patch.path}"`)
        }
    })

    writeFileSync(filepath, await placeholders._getOutput())
}


function getPatches(filepath, fragmentFolders, output) {
    const relativePath = relative(output, filepath) + '.fragment.js'
    return fragmentFolders.map(fragmentFolder => {
        const fragmentPath = resolve(fragmentFolder, relativePath)
        return existsSync(fragmentPath) && {
            path: fragmentPath,
            patch: require(fragmentPath).patch
        }
    }).filter(Boolean)
}

module.exports = { patchFile }