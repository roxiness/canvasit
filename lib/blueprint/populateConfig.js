const { stringify, deepAssign, isObject } = require("../utils")
const { blueprintHelpers } = require("./configHelpers")


/**
 * walks through fragments to build a config
//  * @param {{}[]} fragments 
//  * @param {Object.<string, {}>} configs 
 */
function populateConfigs(fragments, configs) {
    for (const fragment of fragments) {
        if (fragment.blueprint.configs)
            deepAssign(configs, fragment.blueprint.configs(blueprintHelpers))
    }
    return replaceSymlinks(resolveSymlinks(configs))
}


/**
 * 
 * @param {Object.<string, any>} configs 
 */
function replaceSymlinks(configs) {
    return _replaceSymlinks(configs)
    function _replaceSymlinks(prop) {
        if (Array.isArray(prop))
            prop = prop.map(_replaceSymlinks)
        else if (isObject(prop)) {
            for (const [key, value] of Object.entries(prop)) {
                prop[key] = _replaceSymlinks(value)
            }
        } else if (typeof prop === 'string')
            prop = prop.replace(/__SYMLINK\((\w+)\)__/g, str => {
                const name = str.match(/__SYMLINK\((\w+)\)__/)[1]
                return stringify(_replaceSymlinks(configs[name]))
            })
        return prop
    }
}

function resolveSymlinks(configs) {
    return _resolveSymlinks(configs)
    function _resolveSymlinks(prop) {
        const breadcrumbs = [...(this.breadcrumbs || [])]
        if (breadcrumbs.includes(prop))
            throw new Error(`circular symlinks ${JSON.stringify(this.breadcrumbs)}`)
        breadcrumbs.push(prop)

        if (prop.__symlink)
            prop = _resolveSymlinks.bind({ breadcrumbs })(configs[prop.__symlink])
        else if (Array.isArray(prop))
            prop = prop.map(_resolveSymlinks)
        else if (isObject(prop)) {
            for (const [key, value] of Object.entries(prop)) {
                prop[key] = _resolveSymlinks(value)
            }
        }
        return prop
    }
}

module.exports = { populateConfigs }