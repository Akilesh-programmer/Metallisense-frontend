import React, { useState, useEffect } from "react";
import OPCConnectionPanel from "../components/dashboard/OPCConnectionPanel";
import ReadingConfigurationPanel from "../components/dashboard/ReadingConfigurationPanel";
import ReadingResultsDisplay from "../components/dashboard/ReadingResultsDisplay";
import { useOPCStatus } from "../hooks/useOPCStatus";

import toast from "react-hot-toast";
import axios from "../utils/axios";

function Dashboard() {
  // Use centralized OPC status context
  const { opcStatus } = useOPCStatus();

  // Core state for dashboard orchestration
  const [latestReading, setLatestReading] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize dashboard data (removed OPC polling as it's centralized now)
  useEffect(() => {
    fetchLatestReading();
  }, []);

  // Fetch latest reading to initialize results display
  const fetchLatestReading = async () => {
    try {
      const response = await axios.get("/spectrometer");
      if (
        response.data.status === "success" &&
        response.data.data.readings?.length > 0
      ) {
        setLatestReading(response.data.data.readings[0]);
      }
    } catch (error) {
      console.error("Failed to fetch latest reading:", error);
    }
  };

  // Handle reading generation from configuration panel
  const handleReadingGenerated = (newReading) => {
    setLatestReading(newReading);
    setIsGenerating(false);

    toast.success("📊 New spectrometer reading generated successfully!");
  };

  // Handle generation start from configuration panel
  const handleGenerationStart = () => {
    setIsGenerating(true);
  };

  // Handle generation error from configuration panel
  const handleGenerationError = () => {
    setIsGenerating(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const res = await axios.post("/users/logout");
      if (res.data?.status === "success") {
        // Clear any client-side auth state
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          /* ignore */
        }
        toast.success("Logged out successfully");
        // Redirect to login page
        window.location.href = "/login";
        return true;
      }
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  ⚡ MetalliSense
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  Real-time Spectrometer Monitoring & Analysis
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    opcStatus?.server?.isRunning ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {opcStatus?.server?.isRunning
                    ? "System Online"
                    : "System Offline"}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-4 inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                    />
                  </svg>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top row: two half-width cards side-by-side on large screens */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="w-full flex gap-6">
            <div className="w-1/2 min-w-0">
              <OPCConnectionPanel />
            </div>
            <div className="w-1/2 min-w-0">
              <ReadingConfigurationPanel
                onReadingGenerated={handleReadingGenerated}
                onGenerationStart={handleGenerationStart}
                onGenerationError={handleGenerationError}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Results row below - full width */}
        </div>

        <div className="w-full pt-6">
          <ReadingResultsDisplay
            latestReading={latestReading}
            isGenerating={isGenerating}
          />
        </div>

        {/* Footer Status Bar */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-4 border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    opcStatus?.server?.isRunning ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                OPC Server: {opcStatus?.server?.currentStatus || "Unknown"}
              </span>
              <span className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    opcStatus?.client?.isConnected
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                Client: {opcStatus?.client?.status || "Unknown"}
              </span>
              {isGenerating && (
                <span className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                  Generating reading...
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
