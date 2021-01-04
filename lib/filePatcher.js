const { readFileSync, writeFileSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')
const { stringify } = require('../utils')
const { Template } = require('./Template.js')

function patchFile(filepath, fragmentFolders, rootDir, configs) {
    let content = readFileSync(filepath, 'utf-8')
    const relativePath = relative(rootDir, filepath) + '.fragment.js'
    const placeholders = new Template(content, { filepath })

    // iterate fragment folders and look for path+.fragment.js
    for (const fragmentFolder of fragmentFolders) {
        const fragmentPath = resolve(fragmentFolder, relativePath)
        if (existsSync(fragmentPath)) {
            require(fragmentPath)
                .patch({ placeholders, configs, stringify })
        }
    }
    writeFileSync(filepath, placeholders._getOutput())
}


module.exports = { patchFile }