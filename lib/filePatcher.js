const { readFileSync, writeFileSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')
const { stringify } = require('./utils')
const { Template } = require('./Template.js')

async function patchFile(filepath, folders, output, configs, imports) {    
    const extensions = ['js', 'json', 'svelte', 'html']
    const patches = getPatches(filepath, folders, output)

    if (!patches.length && !extensions.includes(filepath.split('.').pop()))
        return false


    let content = readFileSync(filepath, 'utf-8')
    const placeholders = new Template(content, { filepath, imports })

    patches.forEach(patch => {
        try {
            patch.patch({ placeholders, configs, stringify })
        } catch (err) {
            console.error(err)
            throw Error(`Could not use patch from "${fragmentPath}"`)
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