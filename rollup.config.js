import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version} (${pkg.homepage})
 * Copyright ${new Date().getFullYear()} ${pkg.author}
 * Licensed under ${pkg.license}
 */`;

export default {
  input: 'src/js/bootstrap-progress-extension.js',
  output: [
    {
      file: 'dist/js/bootstrap-progress-extension.js',
      format: 'umd',
      name: 'bootstrapProgressBars',
      banner,
      globals: {
        bootstrap: 'bootstrap'
      }
    },
    {
      file: 'dist/js/bootstrap-progress-extension.esm.js',
      format: 'esm',
      banner
    },
    {
      file: 'dist/js/bootstrap-progress-extension.min.js',
      format: 'umd',
      name: 'bootstrapProgressBars',
      banner,
      plugins: [terser()],
      globals: {
        bootstrap: 'bootstrap'
      }
    }
  ],
  external: ['bootstrap'],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: '> 0.5%, last 2 versions, Firefox ESR, not dead, not IE 11'
        }]
      ]
    })
  ]
}; 