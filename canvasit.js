/// <reference path="./typedef.js" />

const { resolve, relative, parse, dirname, } = require('path')
const { emptyDirPartial } = require('./lib/utils')
const { fragmentMapper } = require('./lib/blueprint/fragmentMapper')
const { HookHelpers } = require('./lib/blueprint/hookHelpers')
const { fileWalker } = require('./lib/utils/fileWalker')
const { patchFile } = require('./lib/filePatcher')
const {
    existsSync,
    readFileSync,
    removeSync,
    ensureDirSync,
    mkdtempSync,
    rmdirSync,
    readdirSync
} = require('fs-extra')
const { watch } = require('chokidar')
const { configent } = require('configent')
const { spawn, execSync } = require('child_process')
const { populateConfigs } = require('./lib/blueprint/populateConfig')
const defaults = require('./default.config')

/**
 * 
 * @param {string[]|string} paths 
 * @param {string} output 
 * @param {Object.<string, any>} input 
 */
async function merge(paths = [], output, input = {}) {
    const options = configent(defaults, input)
    output = output || options.output || 'output'
    output = resolve(output)
    paths = typeof paths === 'string' ? paths.split(',') : paths

    if (options.hooks.init)
        await options.hooks.init({ options, paths })

    paths.unshift(...options.include)

    const fragments = []
        .concat(...paths.map(fragmentMapper(options.basepath)))
        .filter(Boolean)

    const _run = async () => {
        return await run(fragments, output, options)
    }

    if (options.watch) {
        const watcher = watch(fragments.map(f => f.path))
            .on('ready', () => {
                console.log('watching', fragments.map(f => f.name))
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
                            removeSync(outputFile)
                        }
                        await _run()
                    }
                })
            })
    }
    emptyDirPartial(output, options.ignore)
    const result = await _run()

    if (options.exec)
        runExec(options.exec, output)

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

async function run(fragments, output, options) {
    const basename = parse(output).base
    const tmpPath = '.canvasit-temp'
    ensureDirSync(tmpPath)
    const tmpOutput = mkdtempSync(`${resolve(tmpPath, basename)}-`)

    const folders = fragments.map(f => f.template)
    const configs = {}
    const imports = {}
    const ctx = { configs, imports, fragments, output: tmpOutput, folders }
    const handleEvent = createEventHandler(ctx)

    // map all fragment imports to imports
    Object.assign(imports, ...fragments.map(f => f.blueprint && f.blueprint.imports))

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
    await fileWalker(tmpOutput, async file => await patchFile(file.filepath, folders, tmpOutput, configs, imports), options.ignore)
    await handleEvent('afterPatch')

    if (options.prettier){
        const plugins = options.prettierPlugins.map(p => `--plugin ${p}`).join(' ')
        execSync(`npx prettier "${tmpOutput}/**/*.{js,svelte}" --write --single-quote --no-semi ${plugins}`)
    }

    // copy tmp to actual folder
    await fileWalker(tmpOutput, file => {
        const dest = resolve(output, file.relativePath)
        if (!existsSync(dest) || readFileSync(dest, 'utf8') !== file.content) {
            ensureDirSync(dirname(dest))
            require('fs').copyFileSync(file.filepath, dest)
        }
    }, options.ignore)

    removeSync(tmpOutput)
    if (!readdirSync(tmpPath).length)
        rmdirSync(tmpPath)

    console.log('Created template in', output)
    
    return { configs, fragments }
}

function createEventHandler(ctx) {
    return async function handleEvent(eventName) {
        for (let { blueprint } of ctx.fragments) {
            if (blueprint.hooks && blueprint.hooks[eventName]) {
                const callback = blueprint.hooks[eventName]
                const helpers = new HookHelpers({ ...ctx, blueprint })
                await callback(helpers)
            }
        }
    }
}

/** @type {Blueprint} */
let Blueprint

module.exports = { merge, Blueprint }
