import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.js',
  output: [
    {
      format: 'umd',
      file: 'dist/kwan.js',
      name: 'kwan',
      sourcemap: true,
      plugins: [
        terser({
          compress: {
            pure_funcs: ['console.log'] // 去掉console.log函数
          }
        })
      ]
    },
    {
      format: 'esm',
      file: 'dist/kwan.esm.js',
      sourcemap: false
    }
  ],
  plugins: [
		babel({ babelHelpers: 'bundled' })
	]
}