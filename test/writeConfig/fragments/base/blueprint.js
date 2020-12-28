module.exports = {
    configs: ({ getConfig }) => ({
        literal: '"literal"',
        literalArray: '["foo", "bar"]',
        actualArray: [
            '"thing one"',
            '"thing two"'
        ],
        output: {
            bool: 'true',
            fn: 'aFakeFunction("oot")',
            compiled: {
                literal: getConfig('literalArray'),
                literalArray: getConfig('literalArray'),
                actualArray: getConfig('actualArray'),
            }
        }
    }),
    actions: [
        ({ transform, configs, writeTo, stringify }) => {
            writeTo('myconfig.js', `module.exports.default = ${stringify(configs.output)}`)
        }
    ]
}