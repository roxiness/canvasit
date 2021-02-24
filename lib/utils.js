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

/**
 * @param  {string, ...string} importPath 
 */
function $require(...importPath) {
  return _eval => `__$REQUIRE_${JSON.stringify(importPath)}__${_eval}_$REQUIRE__`
}

/**
 * replaces $require placeholders with actual calls and
 * returns the body and a list of aliased dependencies found
 * @param {string} body 
 * @returns {{body: string, dependencies: string[]}}
 */
function parse$requires(body) {
  const dependencies = []
  body = body.replace(/__\$REQUIRE_(.+?)__(.+?)_\$REQUIRE__/gs, (_, jsonImportPath, _eval) => {
    const importPath = JSON.parse(jsonImportPath)
    const varName = importPath[0]
    if (!dependencies.includes(varName))
      dependencies.push(varName)
    return `${importPath.join('.')}(${_eval})`
  })
  return { body, dependencies }
}


/**
 * 
 * @param {Object.<string, string[]>} dependencyMap 
 * @param {string[]} presentDependencies 
 */
function mapDependenciesToVariables(dependencyMap, presentDependencies) {
  const dependencies = {}
  const declarations = {}
  presentDependencies.forEach(varName => {
    console.log(dependencyMap)
    const [pkg, importProp, ...rest] = [...dependencyMap[varName]]
    dependencies[pkg] = dependencies[pkg] || {}

    if (!rest.length)
      dependencies[pkg][varName] = importProp || 'default'
    else {
      const last = rest.pop()
      const namespace = [importProp, ...rest].join('/')
      dependencies[pkg][importProp] = importProp
      declarations[namespace] = declarations[namespace] || {}
      declarations[namespace][varName] = last
    }
  })
  return { dependencies, declarations }
}

function composeImports({ dependencies, declarations }, mode = 'commonjs') {
  const composed = {
    imports: [],
    declarations: []
  }
  const modes = {
    commonjs: () => {
      Object.entries(dependencies || {}).forEach(([pkg, imports]) => {
        const declarations = keyAndValueToDestructuredString(imports, ': ')
        composed.imports.push(`const ${declarations} = require('${pkg}')`)
      })
    },
    esm: () => {
      Object.entries(dependencies || {}).forEach(([pkg, imports]) => {
        const declarations = Object.entries(imports).length === 1
          ? Object.entries(imports)[0][0]
          : keyAndValueToDestructuredString(imports, ' as ')
        composed.imports.push(`import ${declarations} from '${pkg}'`)
      })
    }
  }
  modes[mode]()

  // declarations
  Object.entries(declarations || {}).forEach(([namespace, vars]) => {
    const declarations = keyAndValueToDestructuredString(vars, ': ')
    composed.declarations.push(`const ${declarations} = ${namespace}`)
  })

  return composed
}

/**
 * converts object `{ obj: 'obj', alias: 'original' }`
 * to string `{ obj, original<separator>alias }`
 * eg `{ obj, original: alias }`
 * or `{ obj, original as alias }`
 * @param {*} obj 
 * @param {*} separator 
 */
function keyAndValueToDestructuredString(obj, separator) {
  const str = Object.entries(obj)
    .map(([k, v]) => k === v ? k : v + separator + k)
    .join(', ')
  return `{ ${str} }`
}



module.exports = {
  $require,
  composeImports,
  parse$requires,
  deepAssign,
  isObject,
  isObjectOrArray,
  mapDependenciesToVariables,
  stringify,
  emptyDirPartial,
  verifyPathExists
}