import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import { readFileSync } from 'fs';

// 使用 Node.js 的 fs 模块读取 package.json
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

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

export default defineConfig({
  input: 'src/index.ts',
  output: [
    // ESM 构建
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      plugins: [terser(terserOptions)]
    },
    // CommonJS 构建
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      plugins: [terser(terserOptions)]
    },
    // UMD 构建 (浏览器)
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
}); 