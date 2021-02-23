module.exports = {
    imports: {
        myPkg: ['my-package', 'nested']
    },
    configs: ({ $request }) => ({
        config: {
            entry: $request('myPkg')("'hey mum'")
        }
    }),
}