import { WebSocketProtocols, WebSocketReadyState, WebSocketEventHandlers } from '../types';

/**
 * BaseWebSocket - 原生 WebSocket 封装基类
 * 继承 EventTarget，提供与原生 WebSocket 完全一致的接口和行为
 */
export abstract class BaseWebSocket extends EventTarget implements WebSocketEventHandlers {
  /**
   * WebSocket 服务器地址
   */
  public readonly url: string;
  
  /**
   * 构造时传入的子协议参数
   */
  protected readonly protocolsParam: WebSocketProtocols | undefined;
  
  /**
   * 原生 WebSocket 实例
   */
  protected socket: WebSocket | null = null;
  
  /**
   * 连接状态常量 - 与原生 WebSocket 保持一致
   */
  public readonly CONNECTING = WebSocketReadyState.CONNECTING;
  public readonly OPEN = WebSocketReadyState.OPEN;
  public readonly CLOSING = WebSocketReadyState.CLOSING;
  public readonly CLOSED = WebSocketReadyState.CLOSED;
  
  /**
   * 事件处理器属性 - 与原生 WebSocket 保持一致
   */
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  
  /**
   * 构造函数
   * @param url WebSocket 服务器地址
   * @param protocols 可选的子协议
   */
  constructor(url: string, protocols?: WebSocketProtocols) {
    super(); // 调用 EventTarget 构造函数
    this.url = url;
    this.protocolsParam = protocols;
  }
  
  /**
   * 当前连接状态 - 与原生 WebSocket 保持一致
   */
  public get readyState(): WebSocketReadyState {
    return this.socket ? this.socket.readyState : WebSocketReadyState.CONNECTING;
  }
  
  /**
   * 二进制数据类型 - 与原生 WebSocket 保持一致
   */
  public get binaryType(): BinaryType {
    return this.socket ? this.socket.binaryType : 'blob';
  }
  
  public set binaryType(value: BinaryType) {
    if (this.socket) {
      console.log(`🔧 BaseWebSocket: 设置二进制类型 | Setting binaryType to: ${value}`);
      this.socket.binaryType = value;
    }
  }
  
  /**
   * 待发送数据的字节数 - 与原生 WebSocket 保持一致
   */
  public get bufferedAmount(): number {
    return this.socket ? this.socket.bufferedAmount : 0;
  }
  
  /**
   * 服务器选择的扩展 - 与原生 WebSocket 保持一致
   */
  public get extensions(): string {
    return this.socket ? this.socket.extensions : '';
  }
  
  /**
   * 服务器选择的子协议 - 与原生 WebSocket 保持一致
   */
  public get protocol(): string {
    return this.socket ? this.socket.protocol : '';
  }
  
  /**
   * 发送数据 - 与原生 WebSocket 保持一致
   * @param data 要发送的数据
   */
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (!this.socket) {
      const errorMsg = '连接未建立 | WebSocket is not connected';
      console.error(`❌ BaseWebSocket: ${errorMsg}`);
      throw new DOMException('WebSocket is not connected', 'InvalidStateError');
    }
    
    if (this.socket.readyState !== WebSocketReadyState.OPEN) {
      const errorMsg = '连接未打开 | WebSocket is not in OPEN state';
      console.error(`❌ BaseWebSocket: ${errorMsg}`);
      throw new DOMException('WebSocket is not in OPEN state', 'InvalidStateError');
    }
    
    console.log(`📤 BaseWebSocket: 发送数据 | Sending data:`, typeof data === 'string' ? data : `[${data.constructor.name}]`);
    this.socket.send(data);
  }
  
  /**
   * 关闭连接 - 与原生 WebSocket 保持一致
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  public close(code?: number, reason?: string): void {
    if (this.socket) {
      console.log(`🔌 BaseWebSocket: 关闭连接 | Closing connection`, 
        code ? `代码 | Code: ${code}` : '', 
        reason ? `原因 | Reason: ${reason}` : ''
      );
      this.socket.close(code, reason);
    }
  }
  
  /**
   * 创建 WebSocket 连接 - 受保护方法，供子类调用
   * @protected
   */
  protected createConnection(): void {
    try {
      console.log(`🔗 BaseWebSocket: 创建连接 | Creating WebSocket connection`);
      
      // 创建原生 WebSocket 实例
      this.socket = new WebSocket(this.url, this.protocolsParam);
      
      // 绑定事件处理器
      this.socket.onopen = (event: Event) => {
        console.log(`✅ BaseWebSocket: 连接已打开 | Connection opened`);
        if (this.socket?.protocol) {
          console.log(`📋 BaseWebSocket: 协商协议 | Negotiated protocol: ${this.socket.protocol}`);
        }
        if (this.socket?.extensions) {
          console.log(`🔧 BaseWebSocket: 支持扩展 | Supported extensions: ${this.socket.extensions}`);
        }
        
        this.handleOpen(event);
      };
      
      this.socket.onmessage = (event: MessageEvent) => {
        console.log(`📥 BaseWebSocket: 收到消息 | Message received:`, 
          typeof event.data === 'string' ? event.data : `[${event.data.constructor.name}]`
        );
        
        this.handleMessage(event);
      };
      
      this.socket.onclose = (event: CloseEvent) => {
        console.log(`🔌 BaseWebSocket: 连接已关闭 | Connection closed - 代码 | Code: ${event.code}, 原因 | Reason: ${event.reason || '无 | None'}`);
        console.log(`🔄 BaseWebSocket: 是否正常关闭 | Was clean: ${event.wasClean ? '是 | Yes' : '否 | No'}`);
        
        this.handleClose(event);
      };
      
      this.socket.onerror = (event: Event) => {
        console.error(`❌ BaseWebSocket: 连接错误 | Connection error occurred`);
        
        this.handleError(event);
      };
      
    } catch (error) {
      console.error(`💥 BaseWebSocket: 创建连接失败 | Failed to create connection:`, error);
      
      // 如果创建失败，异步触发错误事件
      setTimeout(() => {
        const errorEvent = new Event('error');
        this.handleError(errorEvent);
      }, 0);
    }
  }
  
  /**
   * 处理连接打开事件 - 可被子类重写
   * 按照原生 WebSocket 的顺序：先 onopen 属性，后 addEventListener 监听器
   * @protected
   * @param event 打开事件
   */
  protected handleOpen(event: Event): void {
    // 创建新的事件对象，避免直接传递原生事件
    const openEvent = new Event('open');
    
    // 1. 先触发通过 onopen 属性设置的处理器（原生 WebSocket 行为）
    if (this.onopen) {
      console.log(`🎯 BaseWebSocket: 调用 onopen 处理器 | Calling onopen handler`);
      this.onopen(openEvent);
    }
    
    // 2. 再触发通过 addEventListener 注册的监听器
    console.log(`🎯 BaseWebSocket: 分发 open 事件 | Dispatching open event`);
    this.dispatchEvent(openEvent);
  }
  
  /**
   * 处理消息接收事件 - 可被子类重写
   * 按照原生 WebSocket 的顺序：先 onmessage 属性，后 addEventListener 监听器
   * @protected
   * @param event 消息事件
   */
  protected handleMessage(event: MessageEvent): void {
    // 创建新的消息事件对象
    const messageEvent = new MessageEvent('message', {
      data: event.data,
      origin: event.origin,
      lastEventId: event.lastEventId,
      source: event.source,
      ports: event.ports as MessagePort[]
    });
    
    // 1. 先触发通过 onmessage 属性设置的处理器（原生 WebSocket 行为）
    if (this.onmessage) {
      console.log(`🎯 BaseWebSocket: 调用 onmessage 处理器 | Calling onmessage handler`);
      this.onmessage(messageEvent);
    }
    
    // 2. 再触发通过 addEventListener 注册的监听器
    console.log(`🎯 BaseWebSocket: 分发 message 事件 | Dispatching message event`);
    this.dispatchEvent(messageEvent);
  }
  
  
  /**
   * 处理连接关闭事件 - 可被子类重写
   * 按照原生 WebSocket 的顺序：先 onclose 属性，后 addEventListener 监听器
   * @protected
   * @param event 关闭事件
   */
  protected handleClose(event: CloseEvent): void {
    // 创建新的关闭事件对象
    const closeEvent = new CloseEvent('close', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    });
    
    // 1. 先触发通过 onclose 属性设置的处理器（原生 WebSocket 行为）
    if (this.onclose) {
      console.log(`🎯 BaseWebSocket: 调用 onclose 处理器 | Calling onclose handler`);
      this.onclose(closeEvent);
    }
    
    // 2. 再触发通过 addEventListener 注册的监听器
    console.log(`🎯 BaseWebSocket: 分发 close 事件 | Dispatching close event`);
    this.dispatchEvent(closeEvent);
  }
  
  /**
   * 处理连接错误事件 - 可被子类重写
   * 按照原生 WebSocket 的顺序：先 onerror 属性，后 addEventListener 监听器
   * @protected
   * @param event 错误事件
   */
  protected handleError(event: Event): void {
    // 创建新的错误事件对象
    const errorEvent = new Event('error');
    
    // 1. 先触发通过 onerror 属性设置的处理器（原生 WebSocket 行为）
    if (this.onerror) {
      console.log(`🎯 BaseWebSocket: 调用 onerror 处理器 | Calling onerror handler`);
      this.onerror(errorEvent);
    }
    
    // 2. 再触发通过 addEventListener 注册的监听器
    console.log(`🎯 BaseWebSocket: 分发 error 事件 | Dispatching error event`);
    this.dispatchEvent(errorEvent);
  }
}
