const { resolve, relative, parse } = require('path')
const { deepAssign, isObject, stringify } = require('./lib/utils')
const { createHelpers } = require('./lib/helpers')
const { fileWalker } = require('./lib/fileWalker')
const { patchFile } = require('./lib/filePatcher')
const { outputFileSync, existsSync, unlinkSync, emptyDirSync, unlink, readFileSync, readdirSync, removeSync, mkdirSync, ensureDirSync } = require('fs-extra')
const { watch } = require('chokidar')
const { configent } = require('configent')

function verifyPathsExist(paths) {
    paths.forEach(path => {
        if (!existsSync(path)) throw new Error(`could not find fragment: "${path}"`)
    })
}

function merge(paths, output, options = {}) {
    options = configent({ ignore: [] }, options)
    output = output || options.output || 'output'
    output = resolve(output)

    if (options.include)
        paths = [...options.include, ...paths]

    if (options.basepath)
        paths = paths.map(p => resolve(options.basepath, p))

    const _run = () => {
        return run(paths, output, options)
    }

    verifyPathsExist(paths, output, options)

    if (options.watch) {
        const watcher = watch(paths)
            .on('ready', () => {
                watcher.on('all', (event, path) => {
                    const eventMap = {
                        'add': `added`,
                        'change': `changed`,
                        'unlink': 'deleted'
                    }
                    const msg = eventMap[event]

                    if (msg) {
                        Object.keys(require.cache).forEach(key => delete require.cache[key])
                        console.log(`[canvasit] ${msg}: "${path}"`)
                        console.log(`[canvasit] Rebuilding`)
                        if (event === 'unlink') {
                            const rp = getRelativePath(path, paths)
                            const outputFile = (resolve(output, rp))
                            unlinkSync(outputFile)
                        }
                        _run()
                    }
                })
            })
    }
    clearOutput(output, options.ignore)
    const result = _run()
    if (options.exec)
        runExec(options.exec, output)
    return result
}
function runExec(exec, output) {
    const [cmd, ...params] = exec.split(' ')
    require('child_process').spawn(cmd, params, {
        cwd: output,
        stdio: ['inherit', 'inherit', 'inherit'],
        shell: true,
    })
}

function clearOutput(output, ignore) {
    if (existsSync(output)) {
        const files = readdirSync(output)
        files.forEach(file => {
            if (!ignore.includes(file))
                removeSync(resolve(output, file))
        })
    }
}

function run(paths, output, options) {
    const basename = parse(output).base
    ensureDirSync('temp')
    const tmpOutput = require('fs').mkdtempSync(`temp/${basename}-`)

    const fragments = createFragments(paths)
    const folders = fragments.map(f => f.template)
    const configs = {}
    const ctx = { configs, fragments, output: tmpOutput, folders }
    const handleEvent = createEventHandler(ctx)

    // create configs
    handleEvent('beforeConfig')
    populateConfigs(fragments, configs)
    handleEvent('afterConfig')

    // copy non fragment files to tmp
    handleEvent('beforeCopy')
    fileWalker(folders, file => {
        if (!file.filepath.match(/.+\.fragment\.(j|t)s/)) {
            const dest = resolve(tmpOutput, file.relativePath)
            if (!existsSync(dest) || readFileSync(dest, 'utf8') !== file.content)
                outputFileSync(dest, file.content)
        }
    }, options.ignore)
    handleEvent('afterCopy')


    handleEvent('beforePatch')
    fileWalker(tmpOutput, file => patchFile(file.filepath, folders, tmpOutput, configs), options.ignore)
    handleEvent('afterPatch')

    // copy tmp to actual folder
    fileWalker(tmpOutput, file => {
        const dest = resolve(output, file.relativePath)
        if (!existsSync(dest) || readFileSync(dest, 'utf8') !== file.content) {
            outputFileSync(dest, file.content)
        }

    }, options.ignore)
    removeSync(tmpOutput)

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
        const blueprint = existsSync(blueprintPath) && require(blueprintPath)
        const template = resolve(path, 'template')
        if (!blueprint)
            console.log(`[canvasit] no blueprint exists for ${path}`)
        return { blueprint, template, path }
    })
}

/**
 * walks through fragments to build a config
 * @param {{}[]} fragments 
 * @param {Object.<string, {}>} configs 
 */
function populateConfigs(fragments, configs) {
    const blueprintHelpers = { getConfig, stringify, getConfigString }

    for (fragment of fragments) {
        if (fragment.blueprint.configs)
            deepAssign(configs, fragment.blueprint.configs(blueprintHelpers))
    }
    return replaceSymlinks(resolveSymlinks(configs))

    /**
     * returns a root config by deep assigning the specified config from all blueprints
     * @param {string} name 
     */
    function getConfig(name) { return { __symlink: name } }
    function getConfigString(name) { return `__SYMLINK(${name})__` }
}

function replaceSymlinks(configs) {
    return _replaceSymlinks(configs)
    function _replaceSymlinks(prop) {
        if (Array.isArray(prop))
            prop = prop.map(_replaceSymlinks)
        else if (isObject(prop)) {
            for ([key, value] of Object.entries(prop)) {
                prop[key] = _replaceSymlinks(value)
            }
        } else if (typeof prop === 'string')
            prop = prop.replace(/__SYMLINK\((\w+)\)__/g, str => {
                const name = str.match(/__SYMLINK\((\w+)\)__/)[1]
                return stringify(configs[name])
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
            for ([key, value] of Object.entries(prop)) {
                prop[key] = _resolveSymlinks(value)
            }
        }
        return prop
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