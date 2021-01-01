const test = require('ava').default
const { merge } = require('../../templater')
const output = __dirname+'/output'
const fragmentsDir = __dirname + '/fragments'

test('config from self', t => {
    const { configs } = merge(fragmentsDir, ['getConfigFromSelf'], output)
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        getString: 'string',
        getObject: { object: 'object' }
    })
})

test('config from other', t => {
    const { configs } = merge(fragmentsDir, ['getConfigFromSelf', 'getConfigFromOther'], output)
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
    const { configs } = merge(fragmentsDir, ['getConfigFromSelf', 'getConfigFromOther', 'getConfigFromDerived'], output)
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
    const { configs } = merge(fragmentsDir, ['getConfigFromDerived', 'getConfigFromOther', 'getConfigFromSelf'], output)

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
    const { configs } = merge(fragmentsDir, ['getLoop'], output)
    t.deepEqual(configs, {
        loop1: {},
        loop2: {},
    })
})

