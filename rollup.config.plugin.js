import babel from '@rollup/plugin-babel';

const config = {
  input: 'src/plugins/babel-plugin-kwan-jsx.js',
  output: [
    {
      format: 'umd',
      file: 'example/lib/kwan-jsx.js',
      name: 'kwan-jsx',
      sourcemap: false,
    },
  ],
  plugins: [
		babel({ babelHelpers: 'bundled' })
	]
};

export default config;