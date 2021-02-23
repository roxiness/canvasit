module.exports = {
    imports: {
        myPkg: ['my-package']
    },
    configs: ({ $request }) => ({
        aConfig: {
            entry: $request('myPkg')("'hey mum'")
        }
    }),
}