# NexusSocket 测试服务

这是一个用于测试 NexusSocket 库的示例应用，包含服务器和客户端。

## 功能特点

- 服务器定时（每 5 秒）向所有客户端发送当前时间
- 服务器响应客户端的 ping 消息
- 服务器响应客户端的 echo 消息
- 客户端使用 NexusSocket 库与服务器通信
- 客户端展示所有收发的消息

## 目录结构

```
websocket-test/
├── server/          # WebSocket 服务器
│   ├── index.js     # 服务器代码
│   └── package.json # 服务器依赖
├── client/          # 浏览器客户端
│   ├── index.html   # 客户端 HTML
│   ├── main.js      # 客户端 JavaScript
│   ├── vite.config.js # Vite 配置
│   └── package.json # 客户端依赖
└── README.md        # 说明文档
```

## 运行步骤

### 方法一：使用工作区（推荐）

项目使用 pnpm 工作区管理依赖，可以统一使用根目录的 node_modules。

```bash
# 在项目根目录下安装所有依赖并构建
pnpm setup
pnpm build

# 启动服务器
pnpm test:server

# 在另一个终端窗口启动客户端
pnpm test:client
```

### 方法二：单独安装

如果不想使用工作区，也可以按照以下步骤单独安装依赖：

```bash
# 在项目根目录下
pnpm install
pnpm build
```

然后，安装服务器和客户端的依赖：

```bash
# 安装服务器依赖
cd examples/websocket-test/server
pnpm install

# 安装客户端依赖
cd ../client
pnpm install
```

启动服务器：

```bash
cd examples/websocket-test/server
pnpm start
```

在另一个终端窗口中启动客户端：

```bash
cd examples/websocket-test/client
pnpm dev
```

## 使用方法

1. 在客户端页面中，点击"连接"按钮连接到 WebSocket 服务器
2. 连接成功后，状态指示器会变为绿色
3. 服务器会每 5 秒发送一次当前时间
4. 可以点击"发送 Ping"按钮向服务器发送 ping 消息
5. 可以在输入框中输入文本，然后点击"发送 Echo"按钮，服务器会回显相同的消息
6. 点击"断开连接"按钮可以断开与服务器的连接

## 消息格式

所有消息都使用 JSON 格式，包含以下字段：

- `type`: 消息类型（welcome、server-time、ping、pong、echo、echo-reply）
- `message`: 消息内容
- `timestamp`: 消息发送时间

## 故障排除

- 如果连接失败，请确保服务器正在运行，并且端口 8080 未被占用
- 如果客户端无法加载 NexusSocket 库，请确保已经在项目根目录运行了 `pnpm build` 