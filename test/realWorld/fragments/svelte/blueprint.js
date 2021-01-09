module.exports = {
    configs: ({ getConfig, stringify, getConfigString }) => ({
        rollup: {
            plugins: [
                `svelte(${getConfigString('svelte')})`,
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