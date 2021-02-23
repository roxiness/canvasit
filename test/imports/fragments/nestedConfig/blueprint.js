module.exports = {
    imports: {
        myPkg: ['my-package']
    },
    configs: ({ getConfigString, stringify, $request }) => ({
        serialize: { foo: '"bar"' },
        config: {
            entry: $request('myPkg')(getConfigString('serialize'))
        }
    }),
}