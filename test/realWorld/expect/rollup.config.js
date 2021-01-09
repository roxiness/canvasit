export default {
  preserveEntrySignatures: false,
  input: [`src/main.js`],
  output: {
    sourcemap: true,
    format: 'esm',
    dir: buildDir,
    chunkFileNames: `[name]${(production && '-[hash]') || ''}.js`,
  },
  plugins: [
    resolve({
      browser: true,
      dedupe: (importee) => !!importee.match(/svelte(\/|$)/),
    }),
    commonjs(),
    production && terser(),
    !production && !isNollup && serve(),
    !production && !isNollup && livereload(distDir),
    !production && isNollup && Hmr({ inMemory: true, public: assetsDir }),
    production && copyToDist(),
    svelte({
      dev: !production,
      css: (css) => css.write(`bundle.css`),
      hot: isNollup,
      preprocess: [],
    }),
  ],
}
