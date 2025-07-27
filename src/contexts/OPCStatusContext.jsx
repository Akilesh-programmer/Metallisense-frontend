import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import axios from "../utils/axios";

const OPCStatusContext = createContext();

export const OPCStatusProvider = ({ children }) => {
  const [opcStatus, setOpcStatus] = useState({
    server: { isRunning: false, currentStatus: "Unknown" },
    client: { isConnected: false, status: "Disconnected" },
    isInitialized: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Centralized OPC status fetching
  const fetchOPCStatus = useCallback(async () => {
    try {
      const response = await axios.get("/spectrometer/opc-status");
      if (response.data.status === "success") {
        setOpcStatus(response.data.data.opcStatus);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch OPC status:", error);
      setOpcStatus({
        server: { isRunning: false, currentStatus: "Error" },
        client: { isConnected: false, status: "Disconnected" },
        isInitialized: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to OPC Server
  const connectOPC = useCallback(async () => {
    if (!opcStatus?.server?.isRunning) {
      throw new Error(
        "OPC Server is not running. Please start the server first."
      );
    }

    try {
      const response = await axios.post("/spectrometer/opc-connect");
      if (response.data.status === "success") {
        // Force immediate status update after successful connection
        await fetchOPCStatus();
        return response.data;
      }
    } catch (error) {
      console.error("Failed to connect to OPC server:", error);
      throw error;
    }
  }, [opcStatus?.server?.isRunning, fetchOPCStatus]);

  // Disconnect from OPC Server
  const disconnectOPC = useCallback(async () => {
    try {
      const response = await axios.post("/spectrometer/opc-disconnect");
      if (response.data.status === "success") {
        // Force immediate status update after successful disconnection
        await fetchOPCStatus();
        return response.data;
      }
    } catch (error) {
      console.error("Failed to disconnect from OPC server:", error);
      throw error;
    }
  }, [fetchOPCStatus]);

  // Initialize and set up polling
  useEffect(() => {
    fetchOPCStatus(); // Initial fetch

    // Poll every 10 seconds (increased from 2-5 seconds to avoid 429 errors)
    const interval = setInterval(fetchOPCStatus, 10000);

    return () => clearInterval(interval);
  }, [fetchOPCStatus]);

  const contextValue = useMemo(
    () => ({
      opcStatus,
      isLoading,
      lastUpdate,
      fetchOPCStatus,
      connectOPC,
      disconnectOPC,
      // Helper getters
      isServerRunning: opcStatus?.server?.isRunning || false,
      isClientConnected: opcStatus?.client?.isConnected || false,
      serverStatus: opcStatus?.server?.currentStatus || "Unknown",
      clientStatus: opcStatus?.client?.status || "Disconnected",
    }),
    [
      opcStatus,
      isLoading,
      lastUpdate,
      fetchOPCStatus,
      connectOPC,
      disconnectOPC,
    ]
  );

  return (
    <OPCStatusContext.Provider value={contextValue}>
      {children}
    </OPCStatusContext.Provider>
  );
};

// Add PropTypes validation
OPCStatusProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default OPCStatusContext;
