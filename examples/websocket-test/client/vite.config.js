import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      // 确保可以导入项目根目录的源代码
      '@nexus-socket': resolve(__dirname, '../../../src')
    }
  },
  optimizeDeps: {
    // 确保 Vite 不会尝试打包外部的 NexusSocket 库
    exclude: ['@nexus-socket']
  }
}); 