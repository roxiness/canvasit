const { resolve } = require('path')
const { stringify } = require('../utils')
const { parseImports } = require('./$require')
const { readFileSync, writeFileSync, removeSync } = require('fs-extra')

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
    /** @param {HookHelperContext} HookHelperContext */
    constructor(HookHelperContext) {
        this.output = HookHelperContext.output
        this.configs = HookHelperContext.configs
        this.imports = HookHelperContext.imports
        this.fragments = HookHelperContext.fragments
        this.blueprint = HookHelperContext.blueprint
        this.stringify = stringify
    }

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