const {  outputFileSync } = require('fs-extra')
const { resolve, } = require('path')
const { fileWalker } = require('./fileWalker')
const { patchFile } = require('./filePatcher')

function mergeFiles({ folders, configs, output }) {
    fileWalker(folders, file => {
        if (!file.filepath.match(/.+\.fragment\.(j|t)s/)) {
            const dest = resolve(output, file.relativePath)
            outputFileSync(dest, file.content)
        }
    })

    fileWalker(output, file => {
        patchFile(file.filepath, folders, output, configs)
    })
}

module.exports = { mergeFiles }
