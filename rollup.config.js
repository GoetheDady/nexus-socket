import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig([
  // ESM 和 CommonJS 构建
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve(),
      commonjs()
    ]
  },
  // UMD 构建 (浏览器)
  {
    input: 'src/index.ts',
    output: [
      {
        name: 'NexusSocket',
        file: pkg.browser,
        format: 'umd',
        sourcemap: true,
        plugins: [terser()]
      }
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve(),
      commonjs()
    ]
  }
]); 