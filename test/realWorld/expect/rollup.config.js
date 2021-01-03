export default {
  preserveEntrySignatures: false,
  input: [`src/main.js`],
  output: {
    sourcemap: true,
    format: 'esm',
    dir: buildDir,
    chunkFileNames: `[name]${production && '-[hash]' || ''}.js`
  },
  plugins: [
    svelte({
      dev: !production,
      css: css => css.write(`bundle.css`),
      hot: isNollup,
      preprocess: [

      ]
    })
  ]
}
