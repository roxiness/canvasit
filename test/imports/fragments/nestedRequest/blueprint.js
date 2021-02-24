module.exports = {
    imports: {
        myPkg: ['my-package', 'myPkg'],
        nestedPkg: ['nested-package']
    },
    configs: ({ $require }) => ({
        config: {
            entry: $require('myPkg')($require('nestedPkg')("'hey mum'"))
        }
    }),
}