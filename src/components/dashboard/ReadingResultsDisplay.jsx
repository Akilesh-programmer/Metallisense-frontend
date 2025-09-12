import React from "react";
import { formatPercent } from "../../utils/formatters";

function ReadingResultsDisplay({ latestReading }) {
  // We intentionally show raw values and highlight any elements listed
  // in latestReading.deviation_elements (no assumptions about specs).

  if (!latestReading) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 h-full flex flex-col w-full">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
        📊 Latest Results
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 w-full">
        {/* Reading Info */}
        <div className="lg:col-span-1">
          <div className="space-y-5">
            {/* Metal Grade */}
            <div className="p-5 lg:p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="text-sm lg:text-base text-blue-600 font-medium">
                Metal Grade
              </div>
              <div className="text-xl lg:text-2xl font-semibold text-blue-800">
                {latestReading.metal_grade}
              </div>
            </div>

            {/* Temperature and Pressure */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 lg:p-5 bg-orange-50 rounded-lg text-center border-l-4 border-orange-500">
                <div className="text-sm lg:text-base text-orange-600 font-medium">
                  🌡️ Temperature
                </div>
                <div className="text-xl lg:text-2xl font-bold text-orange-800">
                  {latestReading.temperature}°C
                </div>
              </div>

              <div className="p-4 lg:p-5 bg-teal-50 rounded-lg text-center border-l-4 border-teal-500">
                <div className="text-sm lg:text-base text-teal-600 font-medium">
                  ⚡ Pressure
                </div>
                <div className="text-xl lg:text-2xl font-bold text-teal-800">
                  {latestReading.pressure} atm
                </div>
              </div>
            </div>

            {/* Reading Metadata */}
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-500 mb-1">📅 Reading Time</div>
              <div className="text-sm font-medium text-gray-700">
                {new Date(latestReading.createdAt).toLocaleString()}
              </div>
            </div>

            {/* OPC Status */}
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="text-sm text-green-700 font-medium">
                🔗 OPC UA Reading
              </div>
              <div className="text-xs text-green-600">
                Generated via OPC UA Server Connection
              </div>
            </div>

            {/* Deviation Status */}
            {latestReading.deviation_applied && (
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="text-sm text-yellow-700 font-medium">
                  ⚠️ Deviation Applied
                </div>
                <div className="text-xs text-yellow-600">
                  Elements:{" "}
                  {latestReading.deviation_elements?.join(", ") || "Multiple"}
                </div>
              </div>
            )}

            {/* Synthetic Data Badge */}
            {latestReading.is_synthetic && (
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 text-center">
                <div className="text-xs text-purple-700 font-medium">
                  🧪 Synthetic Data for Demo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composition Visualization */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">⚗️</span>
            Composition Analysis
          </h3>

          <div className="space-y-3">
            {Object.entries(latestReading.composition || {})
              .sort(([, a], [, b]) => b - a)
              .map(([element, value]) => {
                const deviationSet = new Set(
                  latestReading.deviation_elements || []
                );
                const outOfSpec = deviationSet.has(element);

                return (
                  <div
                    key={element}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="min-w-[80px] text-sm font-bold text-gray-700 truncate">
                      {element}
                    </div>

                    <div className="flex-1 mx-3">
                      <div
                        className={`text-right ${
                          outOfSpec
                            ? "text-red-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {formatPercent(value, 3)}
                      </div>
                    </div>

                    {outOfSpec && (
                      <div className="ml-4 text-xs text-red-600 font-medium">
                        Out of spec
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Composition Summary removed to reduce redundancy and empty space */}
        </div>
      </div>

      {/* Additional Reading Information */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(latestReading.composition || {}).length}
            </div>
            <div className="text-sm text-gray-600">Elements Detected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {latestReading.deviation_applied ? "Yes" : "No"}
            </div>
            <div className="text-sm text-gray-600">Deviation Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {latestReading.is_synthetic ? "Synthetic" : "Real"}
            </div>
            <div className="text-sm text-gray-600">Data Source</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReadingResultsDisplay;
