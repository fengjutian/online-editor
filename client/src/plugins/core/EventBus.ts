// 事件总线实现
class EventBus {
  private events: Map<string, Set<Function>> = new Map();

  // 订阅事件
  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  // 取消订阅
  off(event: string, callback: Function): void {
    if (this.events.has(event)) {
      this.events.get(event)!.delete(callback);
      if (this.events.get(event)!.size === 0) {
        this.events.delete(event);
      }
    }
  }

  // 触发事件
  emit(event: string, ...args: any[]): void {
    if (this.events.has(event)) {
      this.events.get(event)!.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // 清空所有事件
  clear(): void {
    this.events.clear();
  }
}

// 导出单例
export default new EventBus();