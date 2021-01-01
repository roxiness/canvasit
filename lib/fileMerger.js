const { readdirSync, readFileSync, writeFileSync, statSync, outputFileSync, existsSync } = require('fs-extra')
const { resolve, relative } = require('path')

function mergeFiles({ folders, configs, output }) {
    folders.forEach(copyFiles(output))
    patchFiles(folders, configs)(output)
}

function copyFiles(output) {
    return function copyFiles(templateFolder, _index, _all, rootDir) {
        rootDir = rootDir || templateFolder
        if (existsSync(templateFolder)) { 
            const files = readdirSync(templateFolder)
            for (const file of files) {
                if (!file.match(/.+\.fragment\.(j|t)s/)) {
                    const filepath = resolve(templateFolder, file)
                    const isDir = statSync(filepath).isDirectory()
                    if (isDir) copyFiles(filepath, _index, _all, rootDir)
                    else {
                        const relativePath = relative(rootDir, filepath)
                        const dest = resolve(output, relativePath)
                        const content = readFileSync(filepath, 'utf-8')
                        outputFileSync(dest, content)
                    }
                }
            }
        }
    }
}


function patchFiles(folders, configs) {
    return function patchFiles(dir, rootDir) {
        rootDir = rootDir || dir
        const files = readdirSync(dir)
        for (const file of files) {
            const filepath = resolve(dir, file)
            const isDir = statSync(filepath).isDirectory()
            if (isDir)
                patchFiles(filepath, rootDir)
            else
                patchFile(filepath, folders, rootDir)
        }
    }

    function patchFile(filepath, fragmentFolders, rootDir) {
        let content = readFileSync(filepath, 'utf-8')
        const relativePath = relative(rootDir, filepath) + '.fragment.js'
        const placeholders = createPlaceholders(content)
        for (const fragmentFolder of fragmentFolders) {
            const fragmentPath = resolve(fragmentFolder, relativePath)
            if (existsSync(fragmentPath)) {
                const patch = require(fragmentPath).patch
                function createAfter(target, name) {
                    placeholders[name] = ''
                    target = nameToPlaceholder(target)
                    placeholder = nameToPlaceholder(name)
                    content = content.replace(target, `${target}\n\n${placeholder}`)
                }
                patch({ placeholders, createAfter, configs })
            }
        }
        for ([key, val] of Object.entries(placeholders)) {
            content = content.replace(nameToPlaceholder(key), val)
        }
        writeFileSync(filepath, content)
    }

    function createPlaceholders(content) {
        const results = content.match(/__[A-Z0-9]+__/g) || []
        const placeholders = results
            .map(placeholderToName)
            .reduce((acc, cur) => ({ ...acc, [cur]: '' }), {})
        return placeholders
    }
}

function placeholderToName(placeholder) {
    return placeholder.replace(/(^__|__$)/g, '').toLowerCase()
}

function nameToPlaceholder(name) {
    return `__${name.toUpperCase()}__`
}

module.exports = { mergeFiles }