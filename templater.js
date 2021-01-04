const { resolve } = require('path')
const { deepAssign, isObjectOrArray, stringify } = require('./utils')
const { mergeFiles } = require('./lib/fileMerger')
const { readFileSync, writeFileSync } = require('fs-extra')

function merge(fragmentsDir, combos, output) {
    const fragments = combos.map(name => ({
        blueprint: require(`${fragmentsDir}/${name}/blueprint.js`),
        path: resolve(fragmentsDir, name)
    }))
    const folders = fragments.map(f => f.path + '/template')
    const configs = {}
    const helpers = {
        transform: (filename, transformFn) => {
            const file = resolve(output, filename)
            const content = readFileSync(file, 'utf-8')
            const newContent = transformFn(content)
            writeFileSync(file, newContent)
        },
        writeTo: (filename, content) => {
            const file = resolve(output, filename)
            writeFileSync(file, content)
        },
        stringify,
        configs
    }

    // create configs
    for (let fragment of fragments) {
        if (fragment.blueprint.configs)
            deepAssign(configs, fragment.blueprint.configs({
                getConfig,
                stringify
            }))
    }
    // copy files
    mergeFiles({ folders, configs, output })

    // run transforms
    for (let fragment of fragments) {
        if (fragment.blueprint.events && fragment.blueprint.events.afterPatch)
            fragment.blueprint.events.afterPatch({ ...helpers })
    }

    return { configs }

    function getConfig(name) {
        if (!configs[name]) {
            configs[name] = {}
            for (let fragment of fragments) {
                const source = fragment.blueprint.configs({ getConfig, stringify })[name]
                if ([configs[name], source].every(isObjectOrArray)) {
                    configs[name] = deepAssign(configs[name], source)
                }
                else if (typeof source !== 'undefined')
                    configs[name] = source
            }
        }
        return configs[name]
    }
}


module.exports = { merge }