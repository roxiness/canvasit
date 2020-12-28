module.exports = {
    configs: ({ getConfig, stringify }) => ({
        rollup: {
            plugins: [
                `svelte(${stringify(getConfig('svelte'), 2)})`,
            ]
        },
        svelte: {
            dev: "!production", // run-time checks      
            // Extract component CSS — better performance
            css: "css => css.write(`bundle.css`)",
            hot: "isNollup",
            preprocess: []
        },
        packagejson: {
            devDependencies: {
                "svelte": "^3.29.4"
            }
        }
    }),
}