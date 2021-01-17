const test = require('ava').default
const { merge } = require('../../canvasit')
const { resolve } = require('path')
const { emptyDirSync, readdirSync, readFileSync, statSync } = require('fs-extra')

test('realworld', async t => {
  emptyDirSync(__dirname + '/output')

  const paths = ['app', 'rollup', 'svelte', 'routify'].map(path => __dirname + '/fragments/' + path)

  await merge(paths, __dirname + '/output')

  compareDirs(__dirname + '/output', __dirname + '/expect', t)
})

function compareDirs(dir1, dir2, t) {
  const files = readdirSync(dir1)
  for (const file of files) {
    const filepath1 = resolve(dir1, file)
    const filepath2 = resolve(dir2, file)
    const isDir = statSync(filepath1).isDirectory()
    if (isDir)
      compareDirs(filepath1, filepath2, t)
    else {
      const content1 = readFileSync(filepath1, 'utf-8')
      const content2 = readFileSync(filepath2, 'utf-8')
      t.is(content1, content2, `files should match:\n  ${filepath1},\n  ${filepath2}`)
    }
  }
}