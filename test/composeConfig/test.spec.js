const test = require('ava').default
const { merge } = require('../../canvasit')

function mergeWithBaseDir(combos){
    const output = __dirname+'/output'
    return merge(combos.map(name => __dirname+'/fragments/'+name), output)
}

test('config from self', t => {
    const { configs } = mergeWithBaseDir(['getConfigFromSelf'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        getString: 'string',
        getObject: { object: 'object' }
    })
})

test('config from other', t => {
    const { configs } = mergeWithBaseDir(['getConfigFromSelf', 'getConfigFromOther'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        getString: 'string',
        getObject: { object: 'object' },
        stringFromOther: 'string',
        objectFromOther: { object: 'object' }
    })
})

test('config from derived', t => {
    const { configs } = mergeWithBaseDir(['getConfigFromSelf', 'getConfigFromOther', 'getConfigFromDerived'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        stringFromOther: 'string',
        objectFromOther: { object: 'object' },
        getString: 'string',
        getObject: { object: 'object' },
        stringFromDerived: 'string',
        objectFromDerived: { object: 'object' }
    })
})

test('config from derived reversed', t => {
    const { configs } = mergeWithBaseDir(['getConfigFromDerived', 'getConfigFromOther', 'getConfigFromSelf'])

    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        stringFromOther: 'string',
        objectFromOther: { object: 'object' },
        getString: 'string',
        getObject: { object: 'object' },
        stringFromDerived: 'string',
        objectFromDerived: { object: 'object' }
    })
})

test('loop', t => {
    const { configs } = mergeWithBaseDir(['getLoop'])
    t.deepEqual(configs, {
        loop1: {},
        loop2: {},
    })
})

