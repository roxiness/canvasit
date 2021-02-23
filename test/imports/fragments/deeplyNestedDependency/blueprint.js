module.exports = {
    imports: {
        myPkg: ['my-package', 'nested', 'deeplyNested']
    },
    configs: ({ $request }) => ({
        config: {
            entry: $request('myPkg')("'hey mum'")
        }
    }),
}