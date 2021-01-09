const test = require('ava').default
const { merge } = require('../../canvasit')

function mergeWithBaseDir(combos) {
    const output = __dirname + '/output'
    return merge(combos.map(name => __dirname + '/fragments/' + name), output)
}

test('config from self', t => {
    const { configs } = mergeWithBaseDir(['getConfigFromSelf'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        complex: { array: ['string'] },
        getString: 'string',
        getObject: { object: 'object' }
    })
})

test('config from self and extended', t => {
    const { configs } = mergeWithBaseDir(['getConfigFromSelf', 'extended'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        complex: { array: ['string', 'string2'] },
        getString: 'string',
        getObject: { object: 'object' }
    })
})

test('config from other', t => {
    const { configs } = mergeWithBaseDir(['getConfigFromSelf', 'getConfigFromOther'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        complex: { array: ['string'] },
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
        complex: { array: ['string'] },
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
        complex: { array: ['string'] },
        stringFromOther: 'string',
        objectFromOther: { object: 'object' },
        getString: 'string',
        getObject: { object: 'object' },
        stringFromDerived: 'string',
        objectFromDerived: { object: 'object' }
    })
})

test('loop', t => {
    const err = t.throws(() => mergeWithBaseDir(['getLoop']))
    t.is(err.message, 'circular symlinks [{"__symlink":"loop2"},{"__symlink":"loop1"}]')
})

