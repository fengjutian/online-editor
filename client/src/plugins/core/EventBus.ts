class EventBus {
  private static instance: EventBus;
  private events: Map<string, Array<(data?: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, callback: (data?: any) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
    
    // 触发window事件，以便全局监听
    const customEvent = new CustomEvent(event, { detail: data });
    window.dispatchEvent(customEvent);
  }

  off(event: string, callback?: (data?: any) => void): void {
    if (!this.events.has(event)) return;
    
    if (callback) {
      const callbacks = this.events.get(event);
      if (callbacks) {
        this.events.set(event, callbacks.filter(cb => cb !== callback));
      }
    } else {
      this.events.delete(event);
    }
  }
}

// 导出单例
export default EventBus.getInstance();