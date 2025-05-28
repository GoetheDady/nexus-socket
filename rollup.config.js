import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import pkg from './package.json' assert { type: 'json' };

// 创建 Terser 配置，用于删除 console 语句
const terserOptions = {
  format: {
    comments: false
  },
  compress: {
    drop_console: true,
    drop_debugger: true
  }
};

export default defineConfig([
  // ESM 和 CommonJS 构建
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
        plugins: [terser(terserOptions)]
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        plugins: [terser(terserOptions)]
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
        plugins: [terser(terserOptions)]
      }
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve(),
      commonjs()
    ]
  }
]); 