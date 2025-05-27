import { BaseWebSocket } from './BaseWebSocket';
import { WebSocketProtocols } from '../types';

/**
 * NexusSocket - 基础 WebSocket 封装
 * 继承 BaseWebSocket，保持与原生 WebSocket 相同的使用方式
 */
export class NexusSocket extends BaseWebSocket {
  /**
   * 构造函数
   * @param url WebSocket 服务器地址
   * @param protocols 可选的子协议
   */
  constructor(url: string, protocols?: WebSocketProtocols) {
    super(url, protocols);
    
    console.log(`🚀 NexusSocket: 正在初始化连接 | Initializing connection to: ${url}`);
    if (protocols) {
      console.log(`📋 NexusSocket: 子协议 | Protocols:`, protocols);
    }
    
    // 立即创建连接，与原生 WebSocket 行为一致
    this.createConnection();
  }
}
