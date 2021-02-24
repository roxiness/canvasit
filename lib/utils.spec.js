const test = require('ava').default
const { $require, parse$requires, composeImports, mapDependenciesToVariables } = require('./utils')
const prettier = require('prettier')

test('$require creates a placeholder', t => {
    let result

    result = $require('myPkg')('myEval')
    t.is(result, '__$REQUIRE_["myPkg"]__myEval_$REQUIRE__')

    result = $require('myPkg', 'myProp')('myEval')
    t.is(result, '__$REQUIRE_["myPkg","myProp"]__myEval_$REQUIRE__')
})


test('$require can handle $require nested in $require', t => {
    const result = $require('myPkg')($require('nestedPkg')('myEval'))

    t.is(result, '__$REQUIRE_["myPkg"]____$REQUIRE_["nestedPkg"]__myEval_$REQUIRE___$REQUIRE__')
})

test('parse$require transforms placeholder and populates dependencies', t => {
    const _body =
        '__$REQUIRE_["myPkg"]__myEval_$REQUIRE__' + '\n' +
        '__$REQUIRE_["myPkg","myProp"]__myEval_$REQUIRE__'

    const { dependencies, body } = parse$requires(_body)

    t.is(body, `myPkg(myEval)\nmyPkg.myProp(myEval)`)
    t.deepEqual(dependencies, ['myPkg'])
})

test('parse$require can handle $require nested in $require', t => {
    const _body =
        '__$REQUIRE_["myPkg"]____$REQUIRE_["nestedPkg"]__myEval_$REQUIRE___$REQUIRE__'

    const { dependencies, body } = parse$requires(_body)
    t.is(body, `myPkg(nestedPkg(myEval))`)
    t.deepEqual(dependencies, ['nestedPkg', 'myPkg'])
})

test('mapDependenciesToVariables ignore unused dependencies', t => {
    const dependencyMap = { myPkg: ['my-package'] }

    t.deepEqual(mapDependenciesToVariables(dependencyMap, []), { dependencies: {}, declarations: {} })
})

test('mapDependenciesToVariables normalizes default imports', t => {
    const dependencyMap = { myPkg: ['my-package'] }
    const presentDependencies = ['myPkg']

    t.deepEqual(mapDependenciesToVariables(dependencyMap, presentDependencies), {
        dependencies: { 'my-package': { myPkg: 'default', } },
        declarations: {}
    })
})

test('mapDependenciesToVariables normalizes named imports', t => {
    const dependencyMap = { myPkg: ['my-package', 'myPkg'] }
    const presentDependencies = ['myPkg']

    t.deepEqual(mapDependenciesToVariables(dependencyMap, presentDependencies), {
        dependencies: { 'my-package': { myPkg: 'myPkg', } },
        declarations: {}
    })
})

test('mapDependenciesToVariables normalizes aliased imports', t => {
    const dependencyMap = { alias: ['my-package', 'myPkg'] }
    const presentDependencies = ['alias']

    t.deepEqual(mapDependenciesToVariables(dependencyMap, presentDependencies), {
        dependencies: { 'my-package': { alias: 'myPkg', } },
        declarations: {}
    })
})

test('mapDependenciesToVariables creates declarations for nested  imports', t => {
    const dependencyMap = { myPkg: ['my-package', 'nested', 'myPkg'] }
    const presentDependencies = ['myPkg']

    t.deepEqual(mapDependenciesToVariables(dependencyMap, presentDependencies), {
        dependencies: { 'my-package': { nested: 'nested', } },
        declarations: { nested: { myPkg: 'myPkg' } }
    })
})

test('mapDependenciesToVariables creates assignment namespaces for deeply nested  imports', t => {
    const dependencyMap = { myPkg: ['my-package', 'nested', 'deeplyNested', 'myPkg'] }
    const presentDependencies = ['myPkg']

    t.deepEqual(mapDependenciesToVariables(dependencyMap, presentDependencies), {
        dependencies: { 'my-package': { nested: 'nested', } },
        declarations: { 'nested/deeplyNested': { myPkg: 'myPkg' } }
    })
})

test('mapDependenciesToVariables creates aliased when needed', t => {
    const dependencyMap = { alias: ['my-package', 'nested', 'deeplyNested', 'myPkg'] }
    const presentDependencies = ['alias']

    t.deepEqual(mapDependenciesToVariables(dependencyMap, presentDependencies), {
        dependencies: { 'my-package': { nested: 'nested', } },
        declarations: { 'nested/deeplyNested': { alias: 'myPkg' } }
    })
})

test('mapDependenciesToVariables can handle complex dependencies', t => {
    const dependencyMap = {
        myPkg: ['my-package'],
        nested: ['my-package', 'nested'],
        deeplyNested: ['my-package', 'nested', 'deeplyNested'],
        aliasedThing: ['my-package', 'nested', 'deeplyNested', 'originalThing'],
        veryDeeplyNested: ['my-package', 'nested', 'deeplyNested', 'veryDeeplyNested'],
        ignored: ['my-ignored-package']
    }
    const presentDependencies = ['myPkg', 'nested', 'deeplyNested', 'veryDeeplyNested', 'aliasedThing']

    t.deepEqual(mapDependenciesToVariables(dependencyMap, presentDependencies), {
        dependencies: {
            'my-package': {
                myPkg: 'default',
                nested: 'nested'
            }
        },
        declarations: {
            nested: { deeplyNested: 'deeplyNested' },
            'nested/deeplyNested': {
                aliasedThing: 'originalThing',
                veryDeeplyNested: 'veryDeeplyNested'
            }
        }
    })
})

test('composeImports can do declarations', t => {
    const declarations = { nested: { deeplyNested: 'deeplyNested', aliased: 'original' }, }
    const result = composeImports({ declarations })
    t.deepEqual(result.declarations, [`const { deeplyNested, original: aliased } = nested`])
})

test('composeImports can do commonjs require', t => {
    const dependencies = { 'my-package': { myPkg: 'default', destructured: 'destructured' } }
    const result = composeImports({ dependencies })
    t.deepEqual(result.imports, [`const { default: myPkg, destructured } = require('my-package')`])
})

test('composeImports can do destructured esm import', t => {
    const dependencies = { 'my-package': { myPkg: 'default', destructured: 'destructured' } }
    const result = composeImports({ dependencies }, 'esm')
    t.deepEqual(result.imports, [`import { default as myPkg, destructured } from 'my-package'`])
})

test('composeImports can do default esm import', t => {
    const dependencies = { 'my-package': { myPkg: 'default' } }
    const result = composeImports({ dependencies }, 'esm')
    t.deepEqual(result.imports, [`import myPkg from 'my-package'`])
})