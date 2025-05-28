import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import { readFileSync } from 'fs';

// 使用 Node.js 的 fs 模块读取 package.json
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// 创建 Terser 配置，用于压缩代码和删除 console 语句
const terserOptions = {
  format: {
    comments: false,  // 删除所有注释
    beautify: false,  // 不美化输出
    indent_level: 0   // 不缩进
  },
  compress: {
    // drop_console: true,     // 删除 console 语句
    drop_debugger: true,    // 删除 debugger 语句
    // pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'], // 额外确保移除这些函数
    passes: 2,              // 多次压缩以获得更好的结果
    ecma: 2020,             // 使用 ES2020 语法压缩
    conditionals: true,     // 优化条件表达式
    dead_code: true,        // 删除无法访问的代码
    evaluate: true,         // 尝试评估常量表达式
    join_vars: true,        // 合并连续的变量声明
    loops: true,            // 优化循环
    reduce_vars: true,      // 优化变量使用
    unused: true            // 删除未使用的变量和函数
  },
  // 不启用混淆配置
  mangle: false,  // 禁用变量名混淆
  ecma: 2020      // 使用 ES2020 语法
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
    commonjs(),
    // 添加全局 terser 插件，确保所有文件都被压缩
    terser(terserOptions)
  ]
}); 