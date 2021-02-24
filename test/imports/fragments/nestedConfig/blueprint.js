module.exports = {
    imports: {
        myPkg: ['my-package']
    },
    configs: ({ getConfigString, stringify, $require }) => ({
        serialize: { foo: '"bar"' },
        config: {
            entry: $require('myPkg')(getConfigString('serialize'))
        }
    }),
}