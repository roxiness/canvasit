const { readdirSync, readFileSync, statSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')

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

module.exports = { fileWalker }