/// <reference path="../../typedef.js" />

const { existsSync } = require('fs')
const { resolve, basename } = require('path')
const { verifyPathExists } = require("../utils")

/**
 * Curried function: fragmentMapper(basepath)(path)
 * 
 * 
 * @param {string} basepath 
 */
function fragmentMapper(basepath) {
    const dupes = []
    /**
     * converts path to array of fragments: [...dependencies, { blueprint, template, path }]
     * @param {string} path
     * @returns {Fragment[]|false}
     */
    function mapFragment(path) {
        if (dupes.includes(path))
            return false
        dupes.push(path)

        path = basepath ? resolve(basepath, path) : path
        verifyPathExists(path)
        const blueprintPath = resolve(path, 'blueprint.js')
        const blueprint = existsSync(blueprintPath) && require(blueprintPath)
        const template = resolve(path, 'template')
        const name = blueprint.name || basename(path)
        const dependencies = [].concat(...(blueprint.dependencies || []).map(mapFragment))
        return [...dependencies, { blueprint, template, path, name }]
    }
    return mapFragment
}

module.exports = { fragmentMapper }
