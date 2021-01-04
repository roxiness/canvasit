const { readdirSync, readFileSync, writeFileSync, statSync, outputFileSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')

const { stringify } = require('../utils')
const { Template } = require('./Template.js')

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

function fileWalker(dirs, cb) {
    for (const dir of [].concat(dirs))
        fileWalkerSingleDir(dir, cb)
}

function fileWalkerSingleDir(dir, cb, root) {
    root = root || dir
    if (!existsSync(dir))
        return false
    const files = readdirSync(dir)
    for (const file of files) {
        const filepath = resolve(dir, file)
        const relativePath = relative(root, filepath)
        const isDir = statSync(filepath).isDirectory()
        if (isDir)
            fileWalkerSingleDir(filepath, cb, root)
        else cb(new File(filepath, relativePath, dir))
    }

}

class File {
    constructor(filepath, relativePath, dir) {
        this.filepath = filepath
        this.relativePath = relativePath
        this.dir = dir
        this._content = null
    }
    get content() {
        if (!this._content)
            this._content = readFileSync(this.filepath)
        return this._content
    }
}

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





module.exports = { mergeFiles }
