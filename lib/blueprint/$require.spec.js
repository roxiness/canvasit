const test = require('ava').default
const { $require, parse$requires, composeImports, mapDependenciesToVariables, parseImports } = require('./$require')

test('$require creates a placeholder', t => {
    let result

    result = $require('myPkg')('myEval')
    t.is(result, '__\$REQUIRE_START_["myPkg"]__myEval_$REQUIRE_END__')

    result = $require('myPkg', 'myProp')('myEval')
    t.is(result, '__\$REQUIRE_START_["myPkg","myProp"]__myEval_$REQUIRE_END__')
})

test('$require can be used as a string', t => {
    result = $require('myPkg')
    t.is(result + '', '__\$REQUIRE_START_["myPkg"]__-NO_PARAMS-_$REQUIRE_END__')
})

test('$require can handle $require nested in $require', t => {
    const result = $require('myPkg')(`{\nfoo: ${$require('nestedPkg')('myEval')}\n}`)

    t.is(result, '__\$REQUIRE_START_["myPkg"]__{\nfoo: __\$REQUIRE_START_["nestedPkg"]__myEval_$REQUIRE_END__\n}_$REQUIRE_END__')
})

test('parse$require transforms placeholder and populates dependencies', t => {
    const _body =
        '__\$REQUIRE_START_["myPkg"]__myEval_$REQUIRE_END__' + '\n' +
        '__\$REQUIRE_START_["myPkg","myProp"]__myEval_$REQUIRE_END__'

    const { dependencies, body } = parse$requires(_body)

    t.is(body, `myPkg(myEval)\nmyPkg.myProp(myEval)`)
    t.deepEqual(dependencies, ['myPkg'])
})

test('parse$require can handle $require nested in $require', t => {
    const _body =
        '__\$REQUIRE_START_["myPkg"]__{\nfoo: __\$REQUIRE_START_["nestedPkg"]__myEval_$REQUIRE_END__\n}_$REQUIRE_END__'

    const { dependencies, body } = parse$requires(_body)
    t.is(body, `myPkg({\nfoo: nestedPkg(myEval)\n})`)
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

test('parseImports', t => {
    const dependencies = { myPkg: ['my-package'] }
    const result = parseImports('__\$REQUIRE_START_["myPkg"]__myEval_$REQUIRE_END__', dependencies)
    t.deepEqual(result, {
        body: 'myPkg(myEval)',
        declarations: [],
        imports: [
            'const { default: myPkg } = require(\'my-package\')',
        ],
    })
})