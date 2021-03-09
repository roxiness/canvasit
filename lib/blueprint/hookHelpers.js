const { resolve } = require('path')
const { stringify } = require('../utils')
const { parseImports } = require('./$require')
const { readFileSync, writeFileSync, removeSync } = require('fs-extra')
const { fileWalker } = require('../utils/fileWalker')

/**
 * @typedef {object} HookHelperContext
 * @prop {string} output
 * @prop {Object.<string, any>} configs
 * @prop {Object.<string, Import>} imports
 * @prop {any} fragments
 * @prop {any} blueprint
 */

/**
* @typedef {string[]} Import
*/

class HookHelpers {
    /** @param {HookHelperContext} ctx */
    constructor(ctx) {
        this.output = ctx.output
        this.configs = ctx.configs
        this.imports = ctx.imports
        this.fragments = ctx.fragments
        this.blueprint = ctx.blueprint
        this.stringify = stringify
    }

    fileWalker = callback => fileWalker(this.output, callback)

    /**
     * transforms a file
     * @param {string} filename 
     * @param {function} transformFn 
     */
    transform = (filename, transformFn) => {
        const file = resolve(this.output, filename)
        const content = readFileSync(file, 'utf-8')
        const newContent = transformFn(content)
        writeFileSync(file, newContent)
    }
    /**
     * creates a file
     * @param {string} filename 
     * @param {string} content 
     */
    writeTo = (filename, content) => {
        const file = resolve(this.output, filename)
        writeFileSync(file, content)
    }
    /**
     * 
     * @param {string} content 
     * @param {("commonjs"|"esm"|undefined)} mode 
     * @returns {{body: string, imports: string[], declarations: string[]}}
     */
    parseImports = (content, mode) => {
        return parseImports(content, this.imports, mode)
    }
    removeFile = filename => {
        const file = resolve(this.output, filename)
        removeSync(file)
    }
}

module.exports = { HookHelpers }