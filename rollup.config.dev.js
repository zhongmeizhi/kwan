import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';

const config = {
  input: 'src/index.js',
  output: [
    {
      format: 'umd',
      file: 'example/lib/kwan.umd.js',
      name: 'kwan',
      sourcemap: false,
    },
    {
      format: 'esm',
      file: 'example2/lib/kwan.js',
      name: 'kwan',
      sourcemap: false,
    },
  ],
  plugins: [
    alias({
      entries: [
        { find: /^@\/(.+)\.js$/, replacement: './src/$1.js' },
        { find: /^@\/(.+)(?!^\.js)$/, replacement: './src/$1/index.js' },
      ]
    }),
		babel({ babelHelpers: 'bundled' })
	]
};
 
export default config;