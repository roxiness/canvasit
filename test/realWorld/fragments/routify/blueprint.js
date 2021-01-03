module.exports = {
    configs: ({ getConfig }) => ({
        routify: {
            runtime: {
                useHash: 'false'
            }
        },
        packagejson: {
            scripts: {
                'dev:routify': 'routify'
            },
            devDependencies: {
                "@roxi/routify": "^2.5.1-next-major",
            }
        }
    }),
}