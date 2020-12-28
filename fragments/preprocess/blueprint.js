const postcssImport = require('postcss-import')

module.exports.default = {
    configs: ({ getConfig }) => ({
        postcss: {
            plugins: ['postcssImport()']
        },
        autoPreprocess: {
            postcss: getConfig('postcss'),
            defaults: { style: '"postcss"' }
        },
        svelte: {
            preprocess: [
                autoPreprocess(
                    getConfig('autoPreprocess')
                )
            ]
        }
    })
}