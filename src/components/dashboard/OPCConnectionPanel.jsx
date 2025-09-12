import React, { useState } from "react";
import { useOPCStatus } from "../../hooks/useOPCStatus";
import toast from "react-hot-toast";

function OPCConnectionPanel() {
  // Use centralized OPC status context
  const {
    opcStatus,
    lastUpdate,
    connectOPC,
    disconnectOPC,
    isServerRunning,
    isClientConnected,
  } = useOPCStatus();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Connect to OPC Server using centralized context
  const handleConnect = async () => {
    if (!isServerRunning) {
      toast.error("OPC Server is not running. Please start the server first.");
      return;
    }

    setIsConnecting(true);
    try {
      await connectOPC();
      toast.success("🔗 Connected to OPC Server successfully!");
    } catch (error) {
      console.error("Connection failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to connect to OPC Server. Please try again."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from OPC Server using centralized context
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectOPC();
      toast.success("🔌 Disconnected from OPC Server successfully!");
    } catch (error) {
      console.error("Disconnection failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to disconnect from OPC Server. Please try again."
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Use context values directly (remove redundant local state)
  const isConnected = isClientConnected;
  const serverRunning = isServerRunning;

  return (
    <div className="modern-card p-6">
      <h2 className="text-xl font-bold gradient-text mb-6 flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-3 ${
            isServerRunning
              ? "bg-green-400 status-online"
              : "bg-red-400 status-offline"
          }`}
        ></div>
        🔌 OPC Connection
      </h2>

      {opcStatus ? (
        <div className="space-y-4">
          {/* Server Status */}
          <div
            className={`p-5 rounded-xl border-2 transition-all duration-200 ${
              serverRunning
                ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                : "border-red-200 bg-gradient-to-br from-red-50 to-pink-50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center">
                <span className="mr-2">🖥️</span>
                OPC UA Server
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  serverRunning
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {serverRunning ? "🟢 ONLINE" : "🔴 OFFLINE"}
              </span>
            </div>
            {opcStatus.server?.endpoint && (
              <div className="text-xs text-gray-600 font-mono bg-white/50 p-2 rounded border break-all">
                📍 {opcStatus.server.endpoint}
              </div>
            )}
          </div>

          {/* Client Connection Status */}
          <div
            className={`p-5 rounded-xl border-2 transition-all duration-200 ${
              isConnected
                ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                : "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <span className="mr-2">🔗</span>
                Client Connection
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isConnected ? "🟢 CONNECTED" : "🔴 DISCONNECTED"}
              </span>
            </div>

            {/* Connection Controls */}
            <div className="space-y-3">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !serverRunning}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-200 transform ${
                    !serverRunning
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg"
                  } ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isConnecting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🔗</span>
                      Connect to OPC Server
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-200 transform bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:scale-105 shadow-lg ${
                    isDisconnecting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isDisconnecting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Disconnecting...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">⛔</span>
                      Disconnect Server
                    </span>
                  )}
                </button>
              )}

              {!serverRunning && (
                <div className="text-sm text-amber-700 bg-amber-100 border border-amber-200 p-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    <span className="font-medium">
                      OPC Server must be running to establish connection
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Status Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">
              Connection Details
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>
                <strong>Server Status:</strong>{" "}
                {opcStatus.server?.currentStatus || "Unknown"}
              </div>
              <div>
                <strong>Client Status:</strong>{" "}
                {opcStatus.client?.status || "Unknown"}
              </div>
              <div>
                <strong>System Initialized:</strong>{" "}
                {opcStatus.isInitialized ? "Yes" : "No"}
              </div>
              {opcStatus.client?.lastError && (
                <div className="text-red-600">
                  <strong>Last Error:</strong> {opcStatus.client.lastError}
                </div>
              )}
            </div>
          </div>

          {/* Last Update */}
          <div className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-600">Loading OPC status...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OPCConnectionPanel;
