# NexusSocket

一个为浏览器环境设计的 WebSocket 库，提供增强功能和友好的 API。

## 特点

- 与原生 WebSocket API 完全兼容
- 提供详细的连接状态和错误处理
- 支持多种模块格式 (ESM, CommonJS, UMD)
- 使用 TypeScript 开发，提供完整类型定义
- 轻量级，无外部依赖

## 安装

```bash
# 使用 npm
npm install nexus-socket

# 使用 pnpm
pnpm add nexus-socket

# 使用 yarn
yarn add nexus-socket
```

## 使用方法

### ES 模块 (推荐)

```javascript
import { NexusSocket } from 'nexus-socket';

const socket = new NexusSocket('ws://example.com/socket');

socket.onopen = () => {
  console.log('连接已打开');
  socket.send('Hello, server!');
};

socket.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

socket.onclose = (event) => {
  console.log('连接已关闭:', event.code, event.reason);
};

socket.onerror = (event) => {
  console.error('发生错误');
};
```

### 直接在浏览器中使用 (UMD)

```html
<script src="https://unpkg.com/nexus-socket/dist/nexus-socket.min.js"></script>
<script>
  const socket = new NexusSocket('ws://example.com/socket');
  
  socket.onopen = () => {
    console.log('连接已打开');
  };
  
  // ... 其他事件处理
</script>
```

## API 参考

### NexusSocket 类

`NexusSocket` 类继承自 `BaseWebSocket`，提供与原生 WebSocket 相同的 API。

#### 构造函数

```typescript
constructor(url: string, protocols?: string | string[])
```

- `url`: WebSocket 服务器地址
- `protocols`: 可选的子协议

#### 属性

- `readyState`: 当前连接状态
- `binaryType`: 二进制数据类型
- `bufferedAmount`: 待发送数据的字节数
- `extensions`: 服务器选择的扩展
- `protocol`: 服务器选择的子协议
- `url`: WebSocket 服务器地址

#### 常量

- `CONNECTING`: 连接状态 - 正在连接
- `OPEN`: 连接状态 - 已连接
- `CLOSING`: 连接状态 - 正在关闭
- `CLOSED`: 连接状态 - 已关闭

#### 事件处理器

- `onopen`: 连接打开时的回调函数
- `onmessage`: 收到消息时的回调函数
- `onclose`: 连接关闭时的回调函数
- `onerror`: 发生错误时的回调函数

#### 方法

- `send(data)`: 发送数据
- `close(code?, reason?)`: 关闭连接

## 构建项目

本项目使用 Rollup 进行打包，支持多种输出格式：

```bash
# 安装依赖
pnpm install

# 构建所有格式
pnpm build

# 开发模式 (监视文件变化)
pnpm dev
```

构建输出：
- `dist/index.js` - CommonJS 格式 (Node.js)
- `dist/index.esm.js` - ES 模块格式 (现代浏览器)
- `dist/nexus-socket.min.js` - UMD 格式 (所有浏览器)
- `dist/index.d.ts` - TypeScript 类型定义

## 示例

查看 `examples` 目录中的示例项目：

```bash
# 启动测试服务器
pnpm test:server

# 启动测试客户端
pnpm test:client
```

## 许可证

ISC 