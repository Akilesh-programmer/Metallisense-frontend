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

  // Get status indicator classes
  const getStatusClass = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusDot = (isActive) => {
    return isActive ? "bg-green-500" : "bg-red-500";
  };

  // Use context values directly (remove redundant local state)
  const isConnected = isClientConnected;
  const serverRunning = isServerRunning;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 h-full flex flex-col w-full">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
        🔌 OPC Connection
      </h2>

      {opcStatus ? (
        <div className="space-y-4">
          {/* Server Status */}
          <div className="p-4 lg:p-5 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-sm lg:text-base font-semibold text-gray-700 mb-3">
              OPC UA Server
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${getStatusDot(
                    serverRunning
                  )}`}
                ></div>
                <span className="text-sm lg:text-base font-medium text-gray-700">
                  Server Status
                </span>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(
                  serverRunning
                )}`}
              >
                {serverRunning ? "🟢 Online" : "🔴 Offline"}
              </span>
            </div>
            {opcStatus.server?.endpoint && (
              <div className="mt-2 text-xs text-gray-600 font-mono break-all">
                📍 {opcStatus.server.endpoint}
              </div>
            )}
          </div>

          {/* Client Connection Status */}
          <div
            className={`p-4 rounded-lg border-l-4 ${
              isConnected
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            }`}
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              OPC UA Client
            </h3>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${getStatusDot(
                    isConnected
                  )}`}
                ></div>
                <span className="font-medium text-gray-700">
                  Connection Status
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                  isConnected
                )}`}
              >
                {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
              </span>
            </div>

            {/* Connection Controls */}
            <div className="mt-3">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !serverRunning}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-colors ${
                    !serverRunning
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  } ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isConnecting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      🔄 Connecting...
                    </div>
                  ) : (
                    "🔗 Connect to OPC Server"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-colors bg-red-500 hover:bg-red-600 text-white ${
                    isDisconnecting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isDisconnecting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Disconnecting...
                    </div>
                  ) : (
                    "⛔ Disconnect from OPC Server"
                  )}
                </button>
              )}
            </div>

            {!serverRunning && (
              <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ OPC Server must be running to establish client connection
              </div>
            )}
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
