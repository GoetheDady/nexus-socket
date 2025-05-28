import { WebSocketServer } from 'ws';
import http from 'http';

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket 服务器正在运行');
});

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server });

// 保存所有连接的客户端
const clients = new Set();

// 设置连接超时时间（毫秒）
const TIMEOUT = 5000; // 30 秒

// 当有新的连接时
wss.on('connection', (ws) => {
  console.log('新客户端连接');
  clients.add(ws);
  
  // 设置连接的最后活动时间
  ws.lastActivity = Date.now();
  
  // 创建超时检查定时器
  ws.aliveTimer = setInterval(() => {
    const inactiveTime = Date.now() - ws.lastActivity;
    if (inactiveTime > TIMEOUT) {
      console.log('客户端超时断开连接');
      ws.terminate(); // 强制关闭连接
      clearInterval(ws.aliveTimer);
    }
  }, 1000); // 每 10 秒检查一次
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    message: '欢迎连接到 NexusSocket 测试服务器',
    timestamp: new Date().toISOString()
  }));
  
  // 处理来自客户端的消息
  ws.on('message', (message) => {
    // 更新最后活动时间
    ws.lastActivity = Date.now();
    
    try {
      const data = JSON.parse(message.toString());
      console.log('收到消息:', data);
      
      // 如果是 ping 消息，回复 pong
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          message: '服务器收到了你的 ping 消息',
          originalMessage: data.message,
          timestamp: new Date().toISOString()
        }));
      } 
      // 如果是 echo 消息，回复相同的消息
      else if (data.type === 'echo') {
        ws.send(JSON.stringify({
          type: 'echo-reply',
          message: data.message,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('解析消息时出错:', error);
    }
  });
  
  // 处理连接关闭
  ws.on('close', () => {
    console.log('客户端断开连接');
    clients.delete(ws);
    // 清除超时检查定时器
    if (ws.aliveTimer) {
      clearInterval(ws.aliveTimer);
    }
  });
});

// 定时广播消息给所有客户端
setInterval(() => {
  const time = new Date().toISOString();
  const message = JSON.stringify({
    type: 'server-time',
    message: `服务器时间: ${time}`,
    timestamp: time
  });
  
  clients.forEach((client) => {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(message);
    }
  });
}, 5000); // 每 5 秒发送一次

// 启动服务器
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`WebSocket 服务器已启动，端口: ${PORT}`);
  console.log(`WebSocket 地址: ws://localhost:${PORT}`);
}); 