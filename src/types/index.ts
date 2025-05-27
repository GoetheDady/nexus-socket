/**
 * WebSocket 协议类型
 * 与原生 WebSocket 保持一致
 */
export type WebSocketProtocols = string | string[];

/**
 * WebSocket 连接状态枚举
 * 与原生 WebSocket 的 readyState 保持一致
 */
export enum WebSocketReadyState {
  CONNECTING = 0, // 正在连接
  OPEN = 1,       // 已连接
  CLOSING = 2,    // 正在关闭
  CLOSED = 3      // 已关闭
}

/**
 * WebSocket 事件处理器类型
 * 与原生 WebSocket 事件处理器保持一致
 */
export interface WebSocketEventHandlers {
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
}
