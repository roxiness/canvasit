const test = require('ava').default
const { merge } = require('../../canvasit')
const { emptyDirSync, readFileSync } = require('fs-extra')

test('basic', async t => {
  const name = 'basic'
  const dir = __dirname + '/output/' + name
  emptyDirSync(dir)

  const paths = [name].map(path => __dirname + '/fragments/' + path)

  await merge(paths, dir)

  const content = readFileSync(dir+'/file.js', 'utf-8')
  t.snapshot(content)
})

test('nested config', async t => {
  const name = 'nestedConfig'
  const dir = __dirname + '/output/' + name
  emptyDirSync(dir)

  const paths = [name].map(path => __dirname + '/fragments/' + path)

  await merge(paths, dir)

  const content = readFileSync(dir+'/file.js', 'utf-8')
  t.snapshot(content)
})

test('nested dependency', async t => {
  const name = 'nestedDependency'
  const dir = __dirname + '/output/' + name
  emptyDirSync(dir)

  const paths = [name].map(path => __dirname + '/fragments/' + path)

  await merge(paths, dir)

  const content = readFileSync(dir+'/file.js', 'utf-8')
  t.snapshot(content)
})

test('deeply nested dependency', async t => {
  const name = 'deeplyNestedDependency'
  const dir = __dirname + '/output/' + name
  emptyDirSync(dir)

  const paths = [name].map(path => __dirname + '/fragments/' + path)

  await merge(paths, dir)

  const content = readFileSync(dir+'/file.js', 'utf-8')
  t.snapshot(content)
})

test('nested request', async t => {
  const name = 'nestedRequest'
  const dir = __dirname + '/output/' + name
  emptyDirSync(dir)

  const paths = [name].map(path => __dirname + '/fragments/' + path)

  await merge(paths, dir)

  const content = readFileSync(dir+'/file.js', 'utf-8')
  t.snapshot(content)
})
