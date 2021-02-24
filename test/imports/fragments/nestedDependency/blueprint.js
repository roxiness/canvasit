module.exports = {
    imports: {
        myPkg: ['my-package', 'nested']
    },
    configs: ({ $require }) => ({
        config: {
            entry: $require('myPkg')("'hey mum'")
        }
    }),
}