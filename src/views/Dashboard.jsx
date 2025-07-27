import React, { useState, useEffect, useRef } from "react";
import OPCConnectionPanel from "../components/dashboard/OPCConnectionPanel";
import ReadingConfigurationPanel from "../components/dashboard/ReadingConfigurationPanel";
import ReadingResultsDisplay from "../components/dashboard/ReadingResultsDisplay";
import HistoricalDataTable from "../components/dashboard/HistoricalDataTable";
import { useOPCStatus } from "../hooks/useOPCStatus";
import axios from "../utils/axios";
import toast from "react-hot-toast";

function Dashboard() {
  // Use centralized OPC status context
  const { opcStatus } = useOPCStatus();

  // Core state for dashboard orchestration
  const [latestReading, setLatestReading] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Component refs for triggering updates
  const historicalTableRef = useRef(null);

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

    // Refresh historical data table
    if (historicalTableRef.current?.refreshData) {
      historicalTableRef.current.refreshData();
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-full 2xl:max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center flex-wrap">
              ⚡ MetalliSense Dashboard
              <span className="ml-4 text-lg lg:text-xl font-normal text-gray-500">
                Real-time Spectrometer Monitoring
              </span>
            </h1>
            <p className="text-base lg:text-lg text-gray-600">
              Advanced metal composition analysis with OPC UA integration
            </p>
          </div>
        </div>

        {/* Main Components Layout - Full Width with Responsive Grid */}
        <div className="space-y-6 mb-6">
          {/* OPC Connection and Configuration - Side by Side on Large Screens, Full Width Each */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
            {/* OPC Connection Panel */}
            <div className="w-full">
              <OPCConnectionPanel />
            </div>

            {/* Reading Configuration Panel */}
            <div className="w-full">
              <ReadingConfigurationPanel
                opcStatus={opcStatus}
                onReadingGenerated={handleReadingGenerated}
                onGenerationStart={handleGenerationStart}
                onGenerationError={handleGenerationError}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Reading Results Display - Full Width */}
          <div className="w-full">
            <ReadingResultsDisplay
              latestReading={latestReading}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Historical Data Table - Full Width */}
        <div className="mb-6 w-full">
          <div className="h-fit w-full">
            <HistoricalDataTable ref={historicalTableRef} />
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 border-t-2 border-gray-200">
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
