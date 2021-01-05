const test = require('ava').default
const { merge } = require('../../canvasit')
const { readFileSync, emptyDirSync, outputFileSync, removeSync, existsSync } = require('fs-extra')
const { resolve } = require('path')

test('configs are written correctly', async t => {
    emptyDirSync(__dirname + '/output')

    const fragFiles = createFileHelper(resolve(__dirname, 'output/fragments'))
    const outputFiles = createFileHelper(resolve(__dirname, 'output/output'))

    fragFiles.write('frag1/template/frag1.txt')
    fragFiles.write('frag2/template/frag2.txt')
    fragFiles.write('frag3/template/frag3.txt')

    const files = ['frag1', 'frag2', 'frag3'].map(fragFiles.path)
    merge(files, outputFiles.base, { watch: true })

    t.is(outputFiles.read('frag1.txt'), 'frag1/template/frag1.txt')
    t.is(outputFiles.read('frag2.txt'), 'frag2/template/frag2.txt')
    t.is(outputFiles.read('frag3.txt'), 'frag3/template/frag3.txt')

    await wait(100)
    fragFiles.write('frag1/template/frag1.1.txt')
    await wait(100)
    t.is(outputFiles.read('frag1.1.txt'), 'frag1/template/frag1.1.txt',
        'new files should show up in output')

    await wait(100)
    fragFiles.delete('frag1/template/frag1.1.txt')
    await wait(300)
    t.is(outputFiles.exists('frag1.1.txt'), false,
        'deleted files should disappear from output')
})

async function wait(ms) { await new Promise(resolve => setTimeout(resolve, ms)) }

function createFileHelper(basepath) {
    const _resolve = path => resolve(basepath, path)
    return {
        write: (path, str) => outputFileSync(_resolve(path), str || path),
        read: path => readFileSync(_resolve(path), 'utf-8'),
        delete: path => removeSync(_resolve(path)),
        path: _resolve,
        exists: path => existsSync(_resolve(path)),
        base: basepath
    }
}