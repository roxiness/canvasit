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
            actualArray: [
                '"thing one"',
                '"thing two"'
            ],
            compiled: {
                literal: getConfig('literalArray'),
                literalArray: getConfig('literalArray'),
                actualArray: getConfig('actualArray'),
            }
        }
    }),
    hooks: {
        beforeCopy: () => { },
        afterCopy: () => { },
        beforePatch: () => { },
        afterPatch: ({ transform, configs, writeTo, stringify }) => { 
            writeTo('myconfig.js', `module.exports.default = ${stringify(configs.output)}`)
        }
    }
}