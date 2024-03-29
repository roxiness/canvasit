/**
 * @template {{}} T
 * @template {{}} T2
 * @param {T} target
 * @param  {...T2} sources
 * @return {T&Partial<T2>} //jsdoc unaware of mutation - incorrectly wants partial T2
 */
function deepAssign(target, ...sources) {
  for (const source of sources) {
    if (Array.isArray(source)) {
      target = Array.isArray(target) ? target : []
      target.push(...source)
    }
    else
      for (const key of Reflect.ownKeys(source)) {
        if ([source[key], target[key]].every(isObjectOrArray)) {
          target[key] = deepAssign(target[key], source[key])
        }
        else target[key] = source[key]
      }
  }
  return target
}

const isObject = v => v && typeof v === 'object' && !['Array', 'Date', 'Regexp'].includes(v.constructor.name)
const isObjectOrArray = v => Array.isArray(v) || isObject(v)

/**
 * Like JSON.stringify, but unquotes all values
 * @param {*} obj
 */
function stringify(obj, level = 0) {
  const pad = " ".repeat(level * 2)
  const longPad = pad + "  "
  const entries = []
  const isArray = Array.isArray(obj)

  for (let [key, val] of Object.entries(obj)) {
    if (val.is$require)
      val = val.toString()
    const isString = typeof val === 'string'
    const keyPrefix = isArray ? '' : `${key}: `
    const value = isString ? val : stringify(val, level + 1)
    entries.push(longPad + keyPrefix + value)
  }

  return isArray
    ? `[\n${entries.join(',\n')}\n${pad}]`
    : `{\n${entries.join(',\n')}\n${pad}}`
}

function emptyDirPartial(output, ignore) {
  const { existsSync, readdirSync, removeSync } = require('fs-extra')
  const { resolve } = require('path')
  if (existsSync(output)) {
    const files = readdirSync(output)
    files.forEach(file => {
      if (!ignore.includes(file))
        removeSync(resolve(output, file))
    })
  }
}

function verifyPathExists(path) {
  const { existsSync } = require('fs-extra')
  if (!existsSync(path)) {
    throw Error(`could not find fragment: "${path}"`)
  }
}



module.exports = {
  deepAssign,
  isObject,
  isObjectOrArray,
  stringify,
  emptyDirPartial,
  verifyPathExists
}