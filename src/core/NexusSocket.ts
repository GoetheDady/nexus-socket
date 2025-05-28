import { BaseWebSocket } from './BaseWebSocket';
import { WebSocketProtocols, WebSocketReadyState } from '../types';
import { version } from '../version';

/**
 * NexusSocket - 基础 WebSocket 封装
 * 继承 BaseWebSocket，保持与原生 WebSocket 相同的使用方式
 */
export class NexusSocket extends BaseWebSocket {
  /**
   * 库版本号
   */
  static readonly version: string = version;
  
  /**
   * 最大重连次数
   */
  protected maxReconnectAttempts: number = 5;
  
  /**
   * 当前重连次数
   */
  protected reconnectAttempts: number = 0;
  
  /**
   * 重连延迟时间(毫秒)
   */
  protected reconnectDelay: number = 3000;
  
  /**
   * 重连定时器
   */
  protected reconnectTimer: number | null = null;
  
  /**
   * 标记是否为重连中
   */
  protected isReconnecting: boolean = false;

  /**
   * 标记是否为用户主动关闭
   */
  protected isManualClose: boolean = false;
  
  /**
   * 构造函数
   * @param url WebSocket 服务器地址
   * @param protocols 可选的子协议
   */
  constructor(url: string, protocols?: WebSocketProtocols) {
    super(url, protocols);
    
    // 先注册事件监听器
    this.addEventListener('close', this.reconnectOnClose.bind(this));
    
    // 再创建连接
    this.createConnection();
  }

  /**
   * 清除重连定时器
   */
  protected clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  protected reconnectOnClose(event: Event) {
    // 如果是用户主动关闭，不进行重连
    if (this.isManualClose) {
      console.log('🔌 NexusSocket: 用户主动关闭连接，不进行重连');
      this.isManualClose = false; // 重置标志
      return;
    }
    
    // 正常关闭(code=1000)时不重连
    if ((event as CloseEvent).code === 1000) {
      console.log('🔌 NexusSocket: 连接正常关闭，不进行重连');
      return;
    }
    
    // 超过最大重连次数
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`❌ NexusSocket: 已达到最大重连次数 (${this.maxReconnectAttempts})，停止重连`);
      return;
    }
    
    // 增加重连计数
    this.reconnectAttempts++;
    this.isReconnecting = true;
    
    console.log(`🔄 NexusSocket: 连接已断开，${this.reconnectDelay/1000}秒后尝试第 ${this.reconnectAttempts} 次重连...`);
    
    // 清除之前的定时器
    this.clearReconnectTimer();
    
    // 设置新的定时器
    this.reconnectTimer = setTimeout(() => {
      console.log(`🔄 NexusSocket: 正在尝试重新连接...`);
      this.createConnection();
      this.reconnectTimer = null; // 执行后清空
    }, this.reconnectDelay);
  }
  
  /**
   * 重置重连计数器
   */
  protected resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
  
  /**
   * 分发重连成功事件
   */
  protected dispatchReconnectSuccess() {
    // 创建自定义事件
    const reconnectEvent = new Event('reconnect');
    // 分发事件
    this.dispatchEvent(reconnectEvent);
    
    console.log('🔄 NexusSocket: 重连成功，已分发 reconnect 事件');
  }
  
  /**
   * 覆盖父类的createConnection方法，添加连接成功后的重连计数重置
   */
  public createConnection() {
    // 清理之前的连接
    if (this.socket) {
      this.socket = null;
    }
    // 重置手动关闭标志（重连时）
    this.isManualClose = false;
    
    super.createConnection();
    
    // 使用一次性监听器，避免重复注册
    const handleOpen = () => {
      this.resetReconnectAttempts();
      
      if (this.isReconnecting) {
        this.isReconnecting = false;
        this.dispatchReconnectSuccess();
      } else {
        console.log('🟢 NexusSocket: 连接已建立');
      }
    };
    
    this.addEventListener('open', handleOpen, { once: true });
  }
  
  public get readyState(): WebSocketReadyState {
    if (this.socket) {
      return this.socket.readyState;
    }
    
    // 根据重连状态返回更准确的状态
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return WebSocketReadyState.CLOSED;
    }
    
    return this.isReconnecting ? WebSocketReadyState.CONNECTING : WebSocketReadyState.CLOSED;
  }
  
  public destroy() {
    // 设置手动关闭标志
    this.isManualClose = true;
    // 停止重连
    this.clearReconnectTimer();
    
    // 移除事件监听器
    this.removeEventListener('close', this.reconnectOnClose);
    
    // 关闭连接
    if (this.socket) {
      this.socket.close(1000, '用户主动销毁连接');
    }
    
    // 重置状态
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
  }

  /**
   * 关闭连接 - 重写父类方法，添加手动关闭标志
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  public close(code?: number, reason?: string): void {
    // 设置手动关闭标志
    this.isManualClose = true;
    
    // 清除重连定时器
    this.clearReconnectTimer();
    
    // 调用父类的关闭方法
    super.close(code, reason);
  }
}
