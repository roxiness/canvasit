const test = require('ava').default
const { merge } = require('../../templater')

test('config from self', t => {
    const { configs } = merge(__dirname + '/fragments', ['getConfigFromSelf'])
    t.deepEqual(configs, {
        string: 'string',
        object: { object: 'object' },
        getString: 'string',
        getObject: { object: 'object' }
    })
})

test('config from other', t => {
    const { configs } = merge(__dirname + '/fragments', ['getConfigFromSelf', 'getConfigFromOther'])
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
    const { configs } = merge(__dirname + '/fragments', ['getConfigFromSelf', 'getConfigFromOther', 'getConfigFromDerived'])
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
    const { configs } = merge(__dirname + '/fragments', ['getConfigFromDerived', 'getConfigFromOther', 'getConfigFromSelf'])

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
    const { configs } = merge(__dirname + '/fragments', ['getLoop'])
    t.deepEqual(configs, {
        loop1: {},
        loop2: {},
    })
})

