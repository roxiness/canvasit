
module.exports.default = {
    dependencies: ['basic'],
    configs: ({getConfig})=> ({
        svelte: {
            dev: '!production', // run-time checks      
            // Extract component CSS — better performance
            css: 'css => css.write(`bundle.css`)',
            hot: 'isNollup',
            // preprocess: [
            //     autoPreprocess({
            //         postcss: { plugins: [postcssImport()] },
            //         defaults: { style: 'postcss' }
            //     })
            // ]
        }
    }),

}
