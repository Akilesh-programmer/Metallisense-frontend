import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import socketService from "../utils/socket";
import dashboardAPI from "../services/dashboardAPI";

function MainDashboard() {
  // State management
  const [isSpectrometerConnected, setIsSpectrometerConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [metalGrades, setMetalGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGradeDetails, setSelectedGradeDetails] = useState(null);
  const [incorrectElementsCount, setIncorrectElementsCount] = useState(2);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [spectrometerData, setSpectrometerData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  // Load metal grades on component mount
  useEffect(() => {
    loadMetalGrades();
    // Initialize socket connection
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Socket listener for real-time data
  useEffect(() => {
    const handleSpectrometerReading = (data) => {
      console.log("Received spectrometer data:", data);
      setSpectrometerData(data);
      toast.success("New spectrometer reading received!", { duration: 2000 });
    };

    socketService.onSpectrometerReading(handleSpectrometerReading);

    return () => {
      socketService.offSpectrometerReading(handleSpectrometerReading);
    };
  }, []);

  const loadMetalGrades = async () => {
    setIsLoadingGrades(true);
    try {
      const response = await dashboardAPI.getMetalGradeNames();
      if (response.status === "success") {
        setMetalGrades(response.data.gradeNames);
      }
    } catch (error) {
      toast.error("Failed to load metal grades");
      console.error("Error loading metal grades:", error);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const handleGradeSelection = async (gradeName) => {
    if (!gradeName) {
      setSelectedGrade("");
      setSelectedGradeDetails(null);
      return;
    }

    setSelectedGrade(gradeName);
    try {
      const response = await dashboardAPI.getMetalGradeByName(gradeName);
      if (response.status === "success") {
        setSelectedGradeDetails(response.data.metalGrade);
      }
    } catch (error) {
      toast.error("Failed to load grade details");
      console.error("Error loading grade details:", error);
    }
  };

  const handleSpectrometerConnection = async () => {
    if (isSpectrometerConnected) {
      // Disconnect
      setIsConnecting(true);
      setConnectionStatus("Disconnecting...");
      try {
        const response = await dashboardAPI.disconnectSpectrometer();
        if (response.status === "success") {
          setIsSpectrometerConnected(false);
          setConnectionStatus("Disconnected");
          setSpectrometerData(null);
          toast.success("Disconnected from spectrometer");
        }
      } catch (error) {
        toast.error("Failed to disconnect from spectrometer");
        setConnectionStatus("Error");
        console.error("Disconnect error:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Connect
      setIsConnecting(true);
      setConnectionStatus("Connecting...");
      try {
        console.log("Connecting to spectrometer...");
        const response = await dashboardAPI.connectSpectrometer();
        console.log("Connection response:", response);

        if (response.status === "success") {
          setIsSpectrometerConnected(true);
          setConnectionStatus("Connected");
          toast.success("Successfully connected to spectrometer!");
        }
      } catch (error) {
        console.error("Connection error:", error);

        // More detailed error messages
        let errorMessage = "Failed to connect to spectrometer";
        if (error.response?.status === 500) {
          errorMessage =
            "Server error: Please check if the spectrometer service is running";
        } else if (error.response?.status === 404) {
          errorMessage = "Spectrometer service not found";
        } else if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (!error.response) {
          errorMessage = "Network error: Cannot reach the server";
        }

        toast.error(errorMessage);
        setConnectionStatus("Error");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleConfigUpdate = async () => {
    if (!selectedGrade) {
      toast.error("Please select a metal grade first");
      return;
    }

    if (incorrectElementsCount < 0 || incorrectElementsCount > 10) {
      toast.error("Incorrect elements count must be between 0 and 10");
      return;
    }

    if (!isSpectrometerConnected) {
      toast.error("Please connect to spectrometer first");
      return;
    }

    setIsUpdatingConfig(true);
    try {
      console.log("Updating config with:", {
        selectedGrade,
        incorrectElementsCount,
      });
      const response = await dashboardAPI.updateSpectrometerConfig(
        selectedGrade,
        incorrectElementsCount
      );
      if (response.status === "success") {
        toast.success("Configuration updated successfully!");
      }
    } catch (error) {
      console.error("Config update error:", error);

      // More detailed error messages
      let errorMessage = "Failed to update configuration";
      if (error.response?.status === 500) {
        errorMessage =
          "Server error: Please check if the configuration endpoint is working properly";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid configuration data";
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (!error.response) {
        errorMessage = "Network error: Cannot reach the server";
      }

      toast.error(errorMessage);
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...");

    try {
      await axios.post("/users/logout");
      toast.success("Logged out successfully!", {
        id: loadingToast,
        duration: 2000,
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed, but redirecting anyway...", {
        id: loadingToast,
        duration: 2000,
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  };

  // Helper function for connection status styling
  const getConnectionStatusClass = () => {
    if (isSpectrometerConnected) return "bg-green-100 text-green-800";
    if (
      connectionStatus === "Connecting..." ||
      connectionStatus === "Disconnecting..."
    ) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (connectionStatus === "Error") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Helper function for button text
  const getConnectionButtonText = () => {
    if (isConnecting) {
      return isSpectrometerConnected ? "Disconnecting..." : "Connecting...";
    }
    return isSpectrometerConnected ? "Disconnect" : "Connect to Spectrometer";
  };

  // Parse spectrometer reading if it's a string
  const parseSpectrometerReading = (reading) => {
    if (typeof reading === "string") {
      try {
        // Handle Python dict-like string format
        const cleanedReading = reading.replace(/'/g, '"');
        return JSON.parse(cleanedReading);
      } catch (error) {
        console.error("Error parsing reading:", error);
        return null;
      }
    }
    return reading;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-sm p-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              MetalliSense Dashboard
            </h1>
            <p className="text-gray-600">AI-Driven Alloy Addition System</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Connection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                Spectrometer Connection
              </h2>

              {/* Connection Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusClass()}`}
                  >
                    {isSpectrometerConnected ? "Connected" : connectionStatus}
                  </span>
                </div>

                <button
                  onClick={handleSpectrometerConnection}
                  disabled={isConnecting}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    isSpectrometerConnected
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  } ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {getConnectionButtonText()}
                </button>
              </div>

              {/* Socket Status */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Real-time Data:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      socketService.isSocketConnected()
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {socketService.isSocketConnected() ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-3"></div>
                Spectrometer Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Metal Grade Selection */}
                <div>
                  <label
                    htmlFor="metal-grade-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Metal Grade
                  </label>
                  <select
                    id="metal-grade-select"
                    value={selectedGrade}
                    onChange={(e) => handleGradeSelection(e.target.value)}
                    disabled={isLoadingGrades}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">
                      {isLoadingGrades
                        ? "Loading grades..."
                        : "Select a metal grade"}
                    </option>
                    {metalGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Incorrect Elements Count */}
                <div>
                  <label
                    htmlFor="incorrect-elements-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Incorrect Elements Count
                  </label>
                  <input
                    id="incorrect-elements-input"
                    type="number"
                    min="0"
                    max="10"
                    value={incorrectElementsCount}
                    onChange={(e) =>
                      setIncorrectElementsCount(parseInt(e.target.value) || 0)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter count (0-10)"
                  />
                </div>
              </div>

              {/* Grade Details */}
              {selectedGradeDetails && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {selectedGradeDetails.metal_grade} - Composition Range
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {Object.entries(selectedGradeDetails.composition_range).map(
                      ([element, range]) => (
                        <div
                          key={element}
                          className="bg-white p-3 rounded-md text-center"
                        >
                          <div className="font-semibold text-gray-800">
                            {element}
                          </div>
                          <div className="text-sm text-gray-600">
                            {range[0]}% - {range[1]}%
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Update Configuration Button */}
              <div className="mt-6">
                <button
                  onClick={handleConfigUpdate}
                  disabled={
                    !selectedGrade ||
                    isUpdatingConfig ||
                    !isSpectrometerConnected
                  }
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    !selectedGrade || !isSpectrometerConnected
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  } ${isUpdatingConfig ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isUpdatingConfig
                    ? "Updating Configuration..."
                    : "Update Configuration"}
                </button>
                {!isSpectrometerConnected && selectedGrade && (
                  <p className="text-sm text-amber-600 mt-2 text-center">
                    Connect to spectrometer to update configuration
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Display Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
            Real-time Spectrometer Data
          </h2>

          {spectrometerData ? (
            <div className="space-y-4">
              {/* Data Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    Latest Reading
                  </h3>
                  <p className="text-sm text-gray-600">
                    Received:{" "}
                    {new Date(spectrometerData.timestamp).toLocaleString()}
                  </p>
                </div>
                {spectrometerData.temperature && (
                  <div className="mt-2 sm:mt-0 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    Temperature: {spectrometerData.temperature}°C
                  </div>
                )}
              </div>

              {/* Composition Data */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Composition Analysis
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {(() => {
                    const reading = parseSpectrometerReading(
                      spectrometerData.reading
                    );
                    return reading ? (
                      Object.entries(reading).map(([element, value]) => (
                        <div
                          key={element}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200"
                        >
                          <div className="text-lg font-bold text-blue-800">
                            {element}
                          </div>
                          <div className="text-xl font-semibold text-blue-900">
                            {value}%
                          </div>
                          {selectedGradeDetails &&
                            selectedGradeDetails.composition_range[element] && (
                              <div className="text-xs text-blue-600 mt-1">
                                Target:{" "}
                                {
                                  selectedGradeDetails.composition_range[
                                    element
                                  ][0]
                                }
                                -
                                {
                                  selectedGradeDetails.composition_range[
                                    element
                                  ][1]
                                }
                                %
                              </div>
                            )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-500">
                        Unable to parse reading data
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Connect to the spectrometer and configure settings to start
                receiving real-time data. Data will appear here automatically
                when readings are generated.
              </p>
            </div>
          )}
        </div>

        {/* AI Recommendations Panel - Placeholder for future implementation */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></div>
            AI Recommendations
          </h2>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              AI Analysis Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Once spectrometer data is available, our AI will analyze the
              composition and provide intelligent alloy addition recommendations
              to meet your target specifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
