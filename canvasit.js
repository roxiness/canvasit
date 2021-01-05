const { resolve, relative } = require('path')
const { deepAssign, isObjectOrArray, stringify } = require('./lib/utils')
const { createHelpers } = require('./lib/helpers')
const { fileWalker } = require('./lib/fileWalker')
const { patchFile } = require('./lib/filePatcher')
const { outputFileSync, existsSync, unlinkSync } = require('fs-extra')
const { watch } = require('chokidar')

function merge(paths, output, options = {}) {
    const _run = path => run(paths, output, options)

    if (options.watch) {
        watch(paths)
            .on('add', _run)
            .on('change', _run)
            .on('unlink', path => {
                const rp = getRelativePath(path, paths)
                const outputFile = (resolve(output, rp))
                unlinkSync(outputFile)
                _run()
            })
    }
    return _run()
}

function run(paths, output, options) {
    const fragments = createFragments(paths)
    const folders = fragments.map(f => f.folder)
    const configs = {}
    const ctx = { configs, fragments, output, folders }
    const handleEvent = createEventHandler(ctx)

    // create configs
    handleEvent('beforeConfig')
    populateConfigs(fragments, configs)
    handleEvent('afterConfig')

    // copy files
    handleEvent('beforeCopy')
    fileWalker(folders, file => {
        if (!file.filepath.match(/.+\.fragment\.(j|t)s/)) {
            const dest = resolve(output, file.relativePath)
            outputFileSync(dest, file.content)
        }
    })
    handleEvent('afterCopy')


    handleEvent('beforePatch')
    fileWalker(output, file => patchFile(file.filepath, folders, output, configs))
    handleEvent('afterPatch')

    return { configs }
}

function getRelativePath(path, paths) {
    for (const parent of paths) {
        const parentPath = resolve(parent, 'template')
        if (path.startsWith(parentPath)) {            
            return relative(parentPath, path)
        }
    }
}

/**
 * @param {string[]} paths 
 */
function createFragments(paths) {
    return paths.map(path => {
        const blueprintPath = resolve(path, 'blueprint.js')
        return {
            blueprint: existsSync(blueprintPath) && require(blueprintPath),
            folder: resolve(path, 'template'),
            path,
        }
    })
}

/**
 * walks through fragments to build a config
 * @param {{}[]} fragments 
 * @param {Object.<string, {}>} configs 
 */
function populateConfigs(fragments, configs) {
    const blueprintHelpers = { getConfig, stringify }

    for (let fragment of fragments) {
        if (fragment.blueprint.configs)
            deepAssign(configs, fragment.blueprint.configs(blueprintHelpers))
    }
    return configs

    /**
     * returns a root config by deep assigning the specified config from all blueprints
     * @param {string} name 
     */
    function getConfig(name) {
        if (!configs[name]) {
            configs[name] = {}
            for (let fragment of fragments) {
                const source = fragment.blueprint.configs(blueprintHelpers)[name]
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

function createEventHandler(ctx) {
    return function handleEvent(eventName) {
        for (let { blueprint } of ctx.fragments) {
            if (blueprint.events && blueprint.events[eventName]) {
                const callback = blueprint.events[eventName]
                const helpers = createHelpers(ctx)
                callback(helpers)
            }
        }
    }
}

module.exports = { merge }