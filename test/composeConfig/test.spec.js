const test = require('ava').default
const { merge } = require('../../canvasit')

async function mergeWithBaseDir(combos) {
    const output = __dirname + '/output'
    return await merge(combos.map(name => __dirname + '/fragments/' + name), output, {prettier: false})
}

test('config from self', async t => {
    const { configs } = await mergeWithBaseDir(['getConfigFromSelf'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        complex: { array: ['string'] },
        getString: 'string',
        getObject: { object: 'object' }
    })
})

test('config from self and extended', async t => {
    const { configs } = await mergeWithBaseDir(['getConfigFromSelf', 'extended'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        complex: { array: ['string', 'string2'] },
        getString: 'string',
        getObject: { object: 'object' }
    })
})

test('config from other', async t => {
    const { configs } = await mergeWithBaseDir(['getConfigFromSelf', 'getConfigFromOther'])
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

test('config from derived', async t => {
    const { configs } = await mergeWithBaseDir(['getConfigFromSelf', 'getConfigFromOther', 'getConfigFromDerived'])
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

test('config from derived reversed', async t => {
    const { configs } = await mergeWithBaseDir(['getConfigFromDerived', 'getConfigFromOther', 'getConfigFromSelf'])

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

test('loop', async t => {
    const err = await t.throwsAsync(() => mergeWithBaseDir(['getLoop']))
    t.is(err.message, 'circular symlinks [{"__symlink":"loop2"},{"__symlink":"loop1"}]')
})