/**
 * @param  {...string} importPath 
 */
function $require(...importPath) {
    const fn = _eval => `__$REQUIRE_START_${JSON.stringify(importPath)}__${_eval || ''}_$REQUIRE_END__`
    fn.toString = () => `__$REQUIRE_START_${JSON.stringify(importPath)}__-NO_PARAMS-_$REQUIRE_END__`
    fn.is$require = true
    return fn
}




/**
 * replaces $require placeholders with actual calls and
 * returns the body and a list of aliased dependencies found
 * @param {string} body 
 * @returns {{body: string, dependencies: string[]}}
 */
function parse$requires(body) {
    const dependencies = []
    while (body.match(/__\$REQUIRE_START_/)) {
        body = body.replace(/__\$REQUIRE_START_(\[[^\]]+\])__(((?!__\$REQUIRE_START_).)*?)_\$REQUIRE_END__/gms, (...rest) => {
            const [_, jsonImportPath, _eval] = rest
            const importPath = JSON.parse(jsonImportPath)
            const varName = importPath[0]
            // keep unique
            if (!dependencies.includes(varName)) dependencies.push(varName)
            if (_eval === '-NO_PARAMS-')
                return importPath.join('.')
            else
                return `${importPath.join('.')}(${_eval})`
        })
    }
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
                const entries = Object.entries(imports)
                    .map(i => ({ varName: i[0], import: i[1] }))

                const varNames =
                    entries.length === 1 && entries[0].import === 'default'
                        ? entries[0].varName
                        : keyAndValueToDestructuredString(imports, ' as ')
                composed.imports.push(`import ${varNames} from '${pkg}'`)
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
 * @param {Object.<string, string>} obj 
 * @param {string} separator 
 */
function keyAndValueToDestructuredString(obj, separator) {
    const str = Object.entries(obj)
        .map(([k, v]) => k === v ? k : v + separator + k)
        .join(', ')
    return `{ ${str} }`
}

/**
 * 
 * @param {string} content 
 * @param {DependenciesMap} dependenciesMap 
 * @param {ScriptMode} mode 
 */
function parseImports(content, dependenciesMap, mode) {
    const { body, dependencies } = parse$requires(content)
    const mappedDependencies = mapDependenciesToVariables(dependenciesMap, dependencies)
    const { imports, declarations } = composeImports(mappedDependencies, mode)
    return { body, imports, declarations }
}



/**
 * @typedef {Object.<string, string[]>} DependenciesMap
 * 
 * @typedef {('commonjs'|'esm'|undefined)} ScriptMode
 */

module.exports = {
    $require,
    composeImports,
    parse$requires,
    parseImports,
    mapDependenciesToVariables,
}