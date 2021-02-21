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
    hooks: {
        afterPatch: ({ transform, configs, stringify }) =>
            transform('app.config.js', str => str.replace(/replaceme/, stringify(configs.output)))
    },
}