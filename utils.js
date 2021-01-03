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
        if ([source[key], target[key]].every(isObject)) {
          target[key] = deepAssign(target[key], source[key])
        }
        else target[key] = source[key]
      }
  }
  return target
}

const isObject = v => v && typeof v === 'object' && !['Array', 'Date', 'Regexp'].includes(v.constructor.name)
const isObjectOrArray = v => Array.isArray(v) || isObject(v)

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


module.exports = { deepAssign, isObject, isObjectOrArray, stringify }