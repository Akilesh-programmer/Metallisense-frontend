import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "../../utils/axios";

const HistoricalDataTable = forwardRef((props, ref) => {
  const [historicalReadings, setHistoricalReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalReadings();
  }, []);

  // Fetch historical readings
  const fetchHistoricalReadings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/spectrometer");
      if (response.data.status === "success") {
        setHistoricalReadings(response.data.data.readings || []);
      }
    } catch (error) {
      console.error("Failed to fetch historical readings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh historical data (called from parent when new reading is generated)
  const refreshData = () => {
    fetchHistoricalReadings();
  };

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refreshData,
  }));

  const formatTopElements = (composition) => {
    if (!composition) return "N/A";

    return Object.entries(composition)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([element, value]) => `${element}: ${value.toFixed(1)}%`)
      .join(", ");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 min-h-[400px] w-full">
      <div className="flex items-center justify-between mb-4 w-full">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
          📊 Historical Readings
        </h2>
        <button
          onClick={refreshData}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-gray-600">Loading historical data...</span>
        </div>
      ) : historicalReadings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm lg:text-base">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                  📅 Timestamp
                </th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                  🏭 Metal Grade
                </th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                  🌡️ Temperature
                </th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                  ⚡ Pressure
                </th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                  ⚗️ Top Elements
                </th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                  🔬 Status
                </th>
                <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                  🔗 Source
                </th>
              </tr>
            </thead>
            <tbody>
              {historicalReadings.slice(0, 15).map((reading, index) => {
                const topElements = formatTopElements(reading.composition);

                return (
                  <tr
                    key={reading._id || index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 lg:px-6 text-gray-700">
                      <div className="font-medium text-sm lg:text-base">
                        {new Date(reading.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500">
                        {new Date(reading.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 lg:px-6">
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {reading.metal_grade}
                      </span>
                    </td>
                    <td className="py-4 px-4 lg:px-6">
                      <span className="font-medium text-orange-700 text-sm lg:text-base">
                        {reading.temperature}°C
                      </span>
                    </td>
                    <td className="py-4 px-4 lg:px-6">
                      <span className="font-medium text-teal-700 text-sm lg:text-base">
                        {reading.pressure} atm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs max-w-xs">
                      <div className="truncate" title={topElements}>
                        {topElements}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${
                            reading.is_synthetic
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {reading.is_synthetic ? "🧪 Synthetic" : "🔬 Real"}
                        </span>
                        {reading.deviation_applied && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium inline-block w-fit">
                            ⚠️ Deviated
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        🔗 OPC UA
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Footer with Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Showing {Math.min(15, historicalReadings.length)} of{" "}
                {historicalReadings.length} total readings
              </span>
              <div className="flex gap-4">
                <span>
                  🧪 Synthetic:{" "}
                  {historicalReadings.filter((r) => r.is_synthetic).length}
                </span>
                <span>
                  ⚠️ Deviated:{" "}
                  {historicalReadings.filter((r) => r.deviation_applied).length}
                </span>
              </div>
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
            📊 No Historical Data
          </h3>
          <p className="text-gray-400 mb-4">
            Generate your first reading to see historical data here.
          </p>
          <div className="text-sm text-gray-500">
            <p>• Connect to OPC Server</p>
            <p>• Select a metal grade</p>
            <p>• Generate spectrometer readings</p>
          </div>
        </div>
      )}
    </div>
  );
});

HistoricalDataTable.displayName = "HistoricalDataTable";

export default HistoricalDataTable;
