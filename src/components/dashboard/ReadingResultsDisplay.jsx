import React, { useState } from "react";
import PropTypes from "prop-types";
import { formatPercent } from "../../utils/formatters";
import AIPredictionResults from "./AIPredictionResults";
import aiService from "../../utils/aiService";
import toast from "react-hot-toast";

function ReadingResultsDisplay({ latestReading }) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [showAIPrediction, setShowAIPrediction] = useState(false);

  // Handle AI Prediction
  const handleGetAIPrediction = async () => {
    if (!latestReading || !latestReading.composition) {
      toast.error("No composition data available for AI analysis");
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);
    setAiPrediction(null);

    try {
      // Determine weight from the reading (provided during generation) or fallback to 10kg
      const readingWeight =
        (latestReading && (latestReading.kg || latestReading.weight)) || 10;

      // Create prediction request from the current reading
      const requestData = aiService.createPredictionRequest(
        latestReading,
        readingWeight
      );

      toast.loading("🤖 Requesting AI analysis...", { id: "ai-prediction" });

      const result = await aiService.getPrediction(requestData);

      if (result.success) {
        setAiPrediction(result.data);
        setShowAIPrediction(true);
        toast.success("✨ AI analysis complete!", { id: "ai-prediction" });
      } else {
        setAiError(result.error);
        toast.error(`AI prediction failed: ${result.error}`, {
          id: "ai-prediction",
        });
      }
    } catch (err) {
      const errorMessage = err.message || "Unexpected error occurred";
      setAiError(errorMessage);
      toast.error(`Error: ${errorMessage}`, { id: "ai-prediction" });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // We intentionally show raw values and highlight any elements listed
  // in latestReading.deviation_elements (no assumptions about specs).

  if (!latestReading) {
    return null;
  }

  return (
    <>
      <div className="modern-card p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold gradient-text flex items-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-3 animate-pulse"></div>
            📊 Analysis Results
          </h2>
          {latestReading && (
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {new Date(latestReading.createdAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* AI Prediction Section */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                🤖
              </div>
              <div>
                <h3 className="font-semibold text-purple-800">AI Analysis</h3>
                <p className="text-sm text-purple-600">
                  Get AI-powered recommendations for this composition
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                {/* weight is taken from the reading (latestReading.kg) when available */}
              </div>

              <button
                onClick={handleGetAIPrediction}
                disabled={!latestReading?.composition || isLoadingAI}
                className={`
                inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg shadow transition-all duration-200
                ${
                  !latestReading?.composition || isLoadingAI
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white hover:shadow-lg"
                }
              `}
              >
                {isLoadingAI ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Get AI Prediction
                  </>
                )}
              </button>
            </div>
          </div>

          {aiError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0 text-xs">
                  ❌
                </div>
                <div>
                  <div className="font-semibold text-red-800 text-sm">
                    AI Analysis Failed
                  </div>
                  <div className="text-sm text-red-700">{aiError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Key Metrics */}
          <div className="space-y-6">
            {/* Metal Grade - Hero Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-100 text-sm font-medium mb-1">
                    Metal Grade
                  </div>
                  <div className="text-3xl font-bold">
                    {latestReading.metal_grade}
                  </div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
              </div>
            </div>

            {/* Temperature and Pressure Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-5 text-white shadow-lg">
                <div className="text-orange-100 text-sm font-medium mb-1">
                  Temperature
                </div>
                <div className="text-2xl font-bold">
                  {latestReading.temperature}°C
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mt-2">
                  <span className="text-sm">🌡️</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl p-5 text-white shadow-lg">
                <div className="text-teal-100 text-sm font-medium mb-1">
                  Pressure
                </div>
                <div className="text-2xl font-bold">
                  {latestReading.pressure}
                </div>
                <div className="text-xs text-teal-100 mt-1">atmospheres</div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-3">
                    🔗
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">
                      OPC UA Connected
                    </div>
                    <div className="text-sm text-green-600">
                      Real-time data stream active
                    </div>
                  </div>
                </div>
              </div>

              {latestReading.deviation_applied && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white mr-3">
                      ⚠️
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-800">
                        Deviation Applied
                      </div>
                      <div className="text-sm text-yellow-600">
                        Elements:{" "}
                        {latestReading.deviation_elements?.join(", ") ||
                          "Multiple"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {latestReading.is_synthetic && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white mr-3">
                      🧪
                    </div>
                    <div>
                      <div className="font-semibold text-purple-800">
                        Synthetic Data
                      </div>
                      <div className="text-sm text-purple-600">
                        Demo/Test Mode Active
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Composition Analysis */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3 text-2xl">⚗️</span>
                Composition Analysis
                <div className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {Object.keys(latestReading.composition || {}).length} Elements
                </div>
              </h3>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {Object.entries(latestReading.composition || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([element, value], index) => {
                    const deviationSet = new Set(
                      latestReading.deviation_elements || []
                    );
                    const outOfSpec = deviationSet.has(element);
                    const percentage = value;
                    const isTopElement = index < 3;

                    return (
                      <div
                        key={element}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          outOfSpec
                            ? "border-red-200 bg-red-50"
                            : isTopElement
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span
                              className={`text-lg font-bold ${
                                outOfSpec
                                  ? "text-red-700"
                                  : isTopElement
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {element}
                            </span>
                            {isTopElement && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                                TOP {index + 1}
                              </span>
                            )}
                            {outOfSpec && (
                              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                                OUT OF SPEC
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xl font-bold ${
                              outOfSpec
                                ? "text-red-600"
                                : isTopElement
                                ? "text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            {formatPercent(value, 3)}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              outOfSpec
                                ? "bg-gradient-to-r from-red-400 to-red-500"
                                : isTopElement
                                ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                : "bg-gradient-to-r from-gray-400 to-gray-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (percentage /
                                  Math.max(
                                    ...Object.values(
                                      latestReading.composition || {}
                                    )
                                  )) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">
                {Object.keys(latestReading.composition || {}).length}
              </div>
              <div className="text-sm font-medium text-blue-700 mt-1">
                Elements Detected
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">
                {latestReading.deviation_applied ? "YES" : "NO"}
              </div>
              <div className="text-sm font-medium text-green-700 mt-1">
                Deviation Applied
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">
                {latestReading.is_synthetic ? "DEMO" : "LIVE"}
              </div>
              <div className="text-sm font-medium text-purple-700 mt-1">
                Data Source
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <div className="text-3xl font-bold text-orange-600">
                {(latestReading.deviation_elements || []).length}
              </div>
              <div className="text-sm font-medium text-orange-700 mt-1">
                Out of Spec
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Prediction Results */}
      {showAIPrediction && (
        <div className="mt-6">
          <AIPredictionResults
            prediction={aiPrediction}
            isLoading={isLoadingAI}
            error={aiError}
          />
        </div>
      )}
    </>
  );
}

ReadingResultsDisplay.propTypes = {
  latestReading: PropTypes.shape({
    composition: PropTypes.object,
    metal_grade: PropTypes.string,
    kg: PropTypes.number,
    weight: PropTypes.number,
    temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pressure: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deviation_applied: PropTypes.bool,
    deviation_elements: PropTypes.array,
    is_synthetic: PropTypes.bool,
    createdAt: PropTypes.string,
  }),
};

export default ReadingResultsDisplay;
