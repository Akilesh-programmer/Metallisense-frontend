import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      // Extract base URL from VITE_BASE_URL and remove /api/v1
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const socketUrl = baseUrl.replace("/api/v1", "");

      console.log("Connecting to socket at:", socketUrl);

      this.socket = io(socketUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket.id);
        this.isConnected = true;
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Listen for spectrometer readings
  onSpectrometerReading(callback) {
    if (this.socket) {
      this.socket.on("spectrometer-reading", callback);
    }
  }

  // Remove spectrometer reading listener
  offSpectrometerReading(callback) {
    if (this.socket) {
      this.socket.off("spectrometer-reading", callback);
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
