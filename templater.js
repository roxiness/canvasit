const { resolve, relative } = require('path')
const { deepAssign, isObjectOrArray } = require('./utils')
const { mergeFiles } = require('./lib/fileMerger')
const { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } = require('fs-extra')

function merge(fragmentsDir, combos, output) {
    const fragments = combos.map(name => ({
        blueprint: require(`${fragmentsDir}/${name}/blueprint.js`),
        path: resolve(fragmentsDir, name)
    }))
    const folders = fragments.map(f => f.path+'/template')
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
        for (let action of fragment.blueprint.actions || []) {
            action({ ...helpers })
        }
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

function copyFiles(source, target, root) {
    root = root || source
    const dir = readdirSync(source)
    for (filename of dir) {
        const file = resolve(source, filename)
        const isDir = statSync(file).isDirectory()
        const dest = resolve(target, relative(root, file))
        if (isDir) {
            mkdirSync(dest)
            copyFiles(file, target, root)
        } else {
            const content = readFileSync(file, 'utf-8')
            writeFileSync(dest, content)
        }
    }
}

function stringify(obj, level = 0) {
    const pad = " ".repeat(level * 2)
    const longPad = pad + "  "
    const entries = []
    const isArray = Array.isArray(obj)

    for ([key, val] of Object.entries(obj)) {
        const isString = typeof val === 'string'
        const keyPrefix = isArray ? '' : `${key}: `
        const value = isString ? val : stringify(val, level + 1)
        entries.push(longPad + keyPrefix + value)
    }

    return isArray
        ? `[\n${entries.join(',\n')}\n${pad}]`
        : `{\n${entries.join(',\n')}\n${pad}}`
}

module.exports = {
    merge, stringify
}