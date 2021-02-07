const { resolve, relative, parse, dirname } = require('path')
const { deepAssign, isObject, stringify, emptyDirPartial, verifyPathExists } = require('./lib/utils')
const { createHelpers } = require('./lib/helpers')
const { fileWalker } = require('./lib/fileWalker')
const { patchFile } = require('./lib/filePatcher')
const { existsSync, unlinkSync, readFileSync, removeSync, ensureDirSync } = require('fs-extra')
const { watch } = require('chokidar')
const { configent } = require('configent')
const { spawn, execSync } = require('child_process')
const defaults = require('./default.config')


async function merge(paths, output, options = {}) {
    options = configent(defaults, options)
    output = output || options.output || 'output'
    output = resolve(output)

    if (options.include)
        paths = [...options.include, ...paths]


    const _run = async () => {
        return await run(paths, output, options)
    }


    if (options.watch) {
        const watcher = watch(paths)
            .on('ready', () => {
                watcher.on('all', async (event, path) => {
                    const eventMap = {
                        'add': `added`,
                        'change': `changed`,
                        'unlink': 'deleted'
                    }
                    const msg = eventMap[event]

                    if (msg) {
                        Object.keys(require.cache).forEach(key => delete require.cache[key])
                        console.log(`[canvasit] Rebuilding (${msg}: "${path}")`)
                        if (event === 'unlink') {
                            const parentDirOfUnlik = paths.find(_path => path.startsWith(_path))
                            const relativePathToUnlik = relative(resolve(parentDirOfUnlik, 'template'), path)
                            const outputFile = resolve(output, relativePathToUnlik)
                            unlinkSync(outputFile)
                        }
                        await _run()
                    }
                })
            })
    }
    emptyDirPartial(output, options.ignore)
    const result = await _run()
    // result.then(() => {
    if (options.exec)
        runExec(options.exec, output)
    // })
    return result
}

function runExec(exec, output) {
    const [cmd, ...params] = exec.split(' ')
    spawn(cmd, params, {
        cwd: output,
        stdio: ['inherit', 'inherit', 'inherit'],
        shell: true,
    })
}

async function run(paths, output, options) {
    const basename = parse(output).base
    ensureDirSync('temp')
    const tmpOutput = require('fs').mkdtempSync(`temp/${basename}-`)

    const fragments = []
        .concat(...paths.map(fragmentMapper(options.basepath)))
        .filter(Boolean)
    const folders = fragments.map(f => f.template)
    const configs = {}
    const ctx = { configs, fragments, output: tmpOutput, folders }
    const handleEvent = createEventHandler(ctx)

    // create configs
    await handleEvent('beforeConfig')
    populateConfigs(fragments, configs)
    await handleEvent('afterConfig')

    // copy non fragment files to tmp
    await handleEvent('beforeCopy')
    await fileWalker(folders, file => {
        if (!file.filepath.match(/.+\.fragment\.(j|t)s/)) {
            const dest = resolve(tmpOutput, file.relativePath)
            ensureDirSync(dirname(dest))
            require('fs').copyFileSync(file.filepath, dest)
        }
    }, options.ignore)
    await handleEvent('afterCopy')


    await handleEvent('beforePatch')
    await fileWalker(tmpOutput, async file => await patchFile(file.filepath, folders, tmpOutput, configs), options.ignore)
    await handleEvent('afterPatch')

    if (options.prettier)
        execSync(`npx prettier "${tmpOutput}/**/*.{js,svelte}" --write --single-quote --no-semi`)
        
    // copy tmp to actual folder
    await fileWalker(tmpOutput, file => {
        const dest = resolve(output, file.relativePath)
        if (!existsSync(dest) || readFileSync(dest, 'utf8') !== file.content) {
            ensureDirSync(dirname(dest))
            require('fs').copyFileSync(file.filepath, dest)
        }

    }, options.ignore)
    removeSync(tmpOutput)

    return { configs, fragments }
}


function fragmentMapper(basepath) {
    const dupes = []
    /**
     * converts path to array of fragments: [...dependencies, { blueprint, template, path }]
     * @param {string} path
     */
    return function mapFragment(path) {
        if (dupes.includes(path))
            return false
        dupes.push(path)

        path = basepath ? resolve(basepath, path) : path
        verifyPathExists(path)
        const blueprintPath = resolve(path, 'blueprint.js')
        const blueprint = existsSync(blueprintPath) && require(blueprintPath)
        const template = resolve(path, 'template')
        const dependencies = [].concat(...(blueprint.dependencies || []).map(mapFragment))
        return [...dependencies, { blueprint, template, path }]
    }
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
            for ([key, value] of Object.entries(prop)) {
                prop[key] = _resolveSymlinks(value)
            }
        }
        return prop
    }
}

function createEventHandler(ctx) {
    return async function handleEvent(eventName) {
        for (let { blueprint } of ctx.fragments) {
            if (blueprint.events && blueprint.events[eventName]) {
                const callback = blueprint.events[eventName]
                const helpers = createHelpers(ctx)
                await callback(helpers)
            }
        }
    }
}

module.exports = { merge }