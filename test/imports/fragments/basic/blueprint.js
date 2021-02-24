module.exports = {
    imports: {
        myPkg: ['my-package']
    },
    configs: ({ $require }) => ({
        aConfig: {
            entry: $require('myPkg')("'hey mum'")
        }
    }),
}