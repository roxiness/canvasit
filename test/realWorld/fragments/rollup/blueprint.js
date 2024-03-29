module.exports = {
    configs: ({  getConfigString }) => ({
        packagejson: {
            scripts: {
                'dev:rollup': 'rollup -cw'
            }
        },
        rollupResolve: {
            browser: "true",
            dedupe: "importee => !!importee.match(/svelte(\\/|$)/)"
        },
        rollup: {
            preserveEntrySignatures: 'false',
            input: '[`src/main.js`]',
            output: {
                sourcemap: 'true',
                format: "'esm'",
                dir: "buildDir",
                // for performance, disabling filename hashing in development
                chunkFileNames: "`[name]${production && '-[hash]' || ''}.js`"
            },
            plugins: [
                // resolve matching modules from current working directory
                `resolve(${getConfigString('rollupResolve')})`,
                `commonjs()`,

                "production && terser()",
                "!production && !isNollup && serve()",
                "!production && !isNollup && livereload(distDir)", // refresh entire window when code is updated
                "!production && isNollup && Hmr({ inMemory: true, public: assetsDir, })", // refresh only updated code
                `production && copyToDist()`,
            ],
        }
    }),
    hooks: {
        beforePatch: ({ transform, configs, stringify }) =>
            transform('rollup.config.js', str => str.replace(/__ROLLUP_CONFIG__/, stringify(configs.rollup)))
    },
}