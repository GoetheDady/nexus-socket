// 导入 NexusSocket 库
import { NexusSocket } from '../../../dist/index.esm.js';

// DOM 元素
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const messageList = document.getElementById('message-list');
const pingBtn = document.getElementById('ping-btn');
const echoInput = document.getElementById('echo-input');
const echoBtn = document.getElementById('echo-btn');

// WebSocket 实例
let socket = null;

// 更新 UI 状态
function updateUIState(isConnected, isConnecting = false) {
  if (isConnecting) {
    statusIndicator.className = 'status-indicator connecting';
    statusText.textContent = '正在连接...';
    connectBtn.disabled = true;
    disconnectBtn.disabled = true;
    pingBtn.disabled = true;
    echoBtn.disabled = true;
  } else if (isConnected) {
    statusIndicator.className = 'status-indicator connected';
    statusText.textContent = '已连接';
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
    pingBtn.disabled = false;
    echoBtn.disabled = false;
  } else {
    statusIndicator.className = 'status-indicator disconnected';
    statusText.textContent = '未连接';
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
    pingBtn.disabled = true;
    echoBtn.disabled = true;
  }
}

// 添加消息到消息列表
function addMessage(type, content, time = new Date()) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const timeSpan = document.createElement('div');
  timeSpan.className = 'time';
  timeSpan.textContent = time instanceof Date 
    ? time.toLocaleTimeString() 
    : new Date(time).toLocaleTimeString();
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  
  if (typeof content === 'object') {
    contentDiv.textContent = JSON.stringify(content, null, 2);
  } else {
    contentDiv.textContent = content;
  }
  
  messageDiv.appendChild(timeSpan);
  messageDiv.appendChild(contentDiv);
  
  messageList.appendChild(messageDiv);
  messageList.scrollTop = messageList.scrollHeight;
}

// 连接到 WebSocket 服务器
function connect() {
  try {
    updateUIState(false, true);
    addMessage('system', '正在连接到服务器...');
    
    // 使用 NexusSocket 创建连接
    socket = new NexusSocket('ws://localhost:8080');
    
    // 连接打开时
    socket.onopen = (event) => {
      updateUIState(true);
      addMessage('system', '已连接到服务器');
    };
    
    // 接收消息时
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage('server', data, data.timestamp);
      } catch (error) {
        addMessage('server', event.data);
      }
    };
    
    // 连接关闭时
    socket.onclose = (event) => {
      updateUIState(false);
      addMessage('system', `连接已关闭: 代码 ${event.code}, 原因: ${event.reason || '未知'}`);
      socket = null;
    };
    
    // 连接错误时
    socket.onerror = (event) => {
      updateUIState(false);
      addMessage('system', '连接发生错误');
      console.error('WebSocket 错误:', event);
    };
    
  } catch (error) {
    updateUIState(false);
    addMessage('system', `连接失败: ${error.message}`);
    console.error('连接错误:', error);
  }
}

// 断开连接
function disconnect() {
  if (socket) {
    socket.close(1000, '用户主动断开连接');
    addMessage('system', '正在断开连接...');
  }
}

// 发送 Ping 消息
function sendPing() {
  if (socket && socket.readyState === socket.OPEN) {
    const message = {
      type: 'ping',
      message: '你好，服务器',
      timestamp: new Date().toISOString()
    };
    
    socket.send(JSON.stringify(message));
    addMessage('client', message, message.timestamp);
  }
}

// 发送 Echo 消息
function sendEcho() {
  if (socket && socket.readyState === socket.OPEN) {
    const text = echoInput.value.trim();
    
    if (text) {
      const message = {
        type: 'echo',
        message: text,
        timestamp: new Date().toISOString()
      };
      
      socket.send(JSON.stringify(message));
      addMessage('client', message, message.timestamp);
      echoInput.value = '';
    }
  }
}

// 事件监听
connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);
pingBtn.addEventListener('click', sendPing);
echoBtn.addEventListener('click', sendEcho);

// 按下回车键发送消息
echoInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter' && !echoBtn.disabled) {
    sendEcho();
  }
});

// 初始化 UI 状态
updateUIState(false);
addMessage('system', '欢迎使用 NexusSocket 测试页面'); 