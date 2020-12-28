/**
 * @template {{}} T
 * @template {{}} T2
 * @param {T} target
 * @param  {...T2} sources
 * @return {T&Partial<T2>} //jsdoc unaware of mutation - incorrectly wants partial T2
 */
function deepAssign(target, ...sources) {
  for (const source of sources) {
    if ([source, target].every(Array.isArray))
      target.push(...source)
    else 
      for (const key of Reflect.ownKeys(source)) {
        if ([source[key], target[key]].every(isObjectOrArray))
        {
          deepAssign(target[key], source[key])
        }
        else target[key] = source[key]
      }
    
  }
  return target
}

const isObject = v => v && typeof v === 'object' && !['Array', 'Date', 'Regexp'].includes(v.constructor.name)
const isObjectOrArray = v => Array.isArray(v) || isObject(v)

module.exports = { deepAssign, isObject, isObjectOrArray }