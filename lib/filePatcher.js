const { readFileSync, writeFileSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')
const { stringify } = require('./utils')
const { Template } = require('./Template.js')

function patchFile(filepath, folders, output, configs) {    
    let content = readFileSync(filepath, 'utf-8')
    const relativePath = relative(output, filepath) + '.fragment.js'
    const placeholders = new Template(content, { filepath })

    // iterate fragment folders and look for path+.fragment.js
    for (const fragmentFolder of folders) {
        const fragmentPath = resolve(fragmentFolder, relativePath)
        if (existsSync(fragmentPath)) {
            const fragment = require(fragmentPath)
            if (!fragment.patch)
                throw Error(`Error: "${fragmentPath}" does not export a patch function`)
            else
                fragment.patch({ placeholders, configs, stringify })
        }
    }
    writeFileSync(filepath, placeholders._getOutput())
}


module.exports = { patchFile }