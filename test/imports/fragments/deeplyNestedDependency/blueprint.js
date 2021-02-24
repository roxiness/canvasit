module.exports = {
    imports: {
        myPkg: ['my-package', 'nested', 'deeplyNested']
    },
    configs: ({ $require }) => ({
        config: {
            entry: $require('myPkg')("'hey mum'")
        }
    }),
}