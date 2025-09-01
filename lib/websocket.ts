// utils/websocket.ts
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  // Event callbacks
  private onMessageCallback: ((data: string) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;
  private onReconnectCallback: ((attempt: number) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clear any existing reconnect timeout
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }

        this.isManualDisconnect = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          this.onConnectCallback?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log("Message received:", event.data);
          this.onMessageCallback?.(event.data);
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket disconnected", event.code, event.reason);
          this.onDisconnectCallback?.();

          // Only attempt reconnect if it wasn't a manual disconnect
          if (!this.isManualDisconnect) {
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.onErrorCallback?.(error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      console.log("Message sent:", message);
    } else {
      console.warn("WebSocket is not connected. Cannot send message:", message);
    }
  }

  private handleReconnect(): void {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      !this.isManualDisconnect
    ) {
      this.reconnectAttempts++;
      const delay = Math.min(
        1000 * Math.pow(2, this.reconnectAttempts - 1),
        30000
      ); // Exponential backoff with max 30s

      console.log(
        `Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      this.onReconnectCallback?.(this.reconnectAttempts);

      this.reconnectTimeout = setTimeout(() => {
        if (!this.isManualDisconnect) {
          this.connect().catch((error) => {
            console.error("Reconnection failed:", error);
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              console.error("Max reconnection attempts reached. Giving up.");
            }
          });
        }
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "Max reconnection attempts reached. Connection failed permanently."
      );
    }
  }

  disconnect(): void {
    this.isManualDisconnect = true;

    // Clear any pending reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect"); // 1000 = normal closure
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    console.log("WebSocket manually disconnected");
  }

  // Event listener methods
  onMessage(callback: (data: string) => void): void {
    this.onMessageCallback = callback;
  }

  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  onReconnect(callback: (attempt: number) => void): void {
    this.onReconnectCallback = callback;
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }

  getReadyStateString(): string {
    if (!this.ws) return "DISCONNECTED";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "OPEN";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }

  // Manual reconnect method
  reconnect(): Promise<void> {
    this.disconnect();
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connect().then(resolve);
      }, 1000);
    });
  }

  // Reset reconnect attempts (useful if you want to retry after a long period)
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  // Update configuration
  setMaxReconnectAttempts(attempts: number): void {
    this.maxReconnectAttempts = attempts;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getMaxReconnectAttempts(): number {
    return this.maxReconnectAttempts;
  }
}
