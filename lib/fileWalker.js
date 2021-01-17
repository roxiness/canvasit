const { readdirSync, readFileSync, statSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')

async function fileWalker(dirs, cb, ignore) {
    for (const dir of [].concat(dirs)) {
        if (!existsSync(dir))
            return false
        await fileWalkerSingleDir(dir, cb, ignore)
    }
}

async function fileWalkerSingleDir(dir, cb, ignore, root) {
    root = root || dir
    const files = readdirSync(dir)
    for (const file of files) {
        if (![].concat(ignore).includes(file)) {
            const filepath = resolve(dir, file)
            const relativePath = relative(root, filepath)
            const isDir = statSync(filepath).isDirectory()
            if (isDir)
                await fileWalkerSingleDir(filepath, cb, ignore, root)
            else await cb(new File(filepath, relativePath, dir))
        }
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
            this._content = readFileSync(this.filepath, 'utf-8')
        return this._content
    }
}

module.exports = { fileWalker }