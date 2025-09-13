import React, { useState } from "react";
import PropTypes from "prop-types";
import AIPredictionResults from "./AIPredictionResults";
import aiService from "../../utils/aiService";
import toast from "react-hot-toast";

function AIAnalysisSection({ latestReading, isEnabled = true }) {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [weight, setWeight] = useState(10); // Default weight in kg

  const handleGetPrediction = async () => {
    if (!latestReading || !latestReading.composition) {
      toast.error("No composition data available for AI analysis");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Create prediction request from the current reading
      const requestData = aiService.createPredictionRequest(latestReading, weight);
      
      toast.loading("🤖 Requesting AI analysis...", { id: "ai-prediction" });

      const result = await aiService.getPrediction(requestData);

      if (result.success) {
        setPrediction(result.data);
        toast.success("✨ AI analysis complete!", { id: "ai-prediction" });
      } else {
        setError(result.error);
        toast.error(`AI prediction failed: ${result.error}`, { id: "ai-prediction" });
      }
    } catch (err) {
      const errorMessage = err.message || "Unexpected error occurred";
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`, { id: "ai-prediction" });
    } finally {
      setIsLoading(false);
    }
  };

  const canPredict = latestReading && latestReading.composition && isEnabled && !isLoading;

  return (
    <div className="space-y-6">
      {/* AI Prediction Panel */}
      <div className="modern-card p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold gradient-text flex items-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mr-3"></div>
            🤖 AI Analysis
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${canPredict ? "bg-green-400" : "bg-gray-400"}`}></div>
            <span className="text-sm text-gray-600">
              {canPredict ? "Ready" : "Waiting for data"}
            </span>
          </div>
        </div>

        {/* Weight Input and Prediction Button */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <span className="mr-2">⚖️</span>
              Prediction Parameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="weight-input" className="block text-sm font-medium text-purple-700 mb-2">
                  Metal Weight (kg)
                </label>
                <input
                  id="weight-input"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value) || 10)}
                  min="0.1"
                  max="10000"
                  step="0.1"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter weight in kg"
                />
                <p className="text-xs text-purple-600 mt-1">
                  Recommended range: 1-100 kg
                </p>
              </div>

              {latestReading && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Current Grade</div>
                    <div className="text-lg font-bold text-purple-800">
                      {latestReading.metal_grade || "Unknown"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Elements</div>
                    <div className="text-lg font-bold text-purple-800">
                      {Object.keys(latestReading.composition || {}).length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prediction Button */}
          <div className="text-center">
            <button
              onClick={handleGetPrediction}
              disabled={!canPredict}
              className={`
                relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 transform
                ${canPredict 
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white hover:scale-105 hover:shadow-xl" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <span className="mr-3 text-xl">🚀</span>
                  Get AI Prediction
                </>
              )}
            </button>
            
            {!canPredict && !isLoading && (
              <p className="text-sm text-gray-500 mt-3">
                {(() => {
                  if (!latestReading) return "📊 Generate a spectrometer reading first";
                  if (!isEnabled) return "⏸️ AI predictions temporarily disabled";
                  return "📋 Ready to analyze composition data";
                })()}
              </p>
            )}
          </div>

          {/* Status Information */}
          {latestReading && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                  ℹ️
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-blue-800 mb-1">
                    How AI Analysis Works
                  </div>
                  <div className="text-blue-700 space-y-1">
                    <p>• Analyzes current composition against target specifications</p>
                    <p>• Provides specific adjustment recommendations</p>
                    <p>• Suggests optimal metal grade for your composition</p>
                    <p>• Takes approximately 30-60 seconds to complete</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                  ❌
                </div>
                <div>
                  <div className="font-semibold text-red-800 mb-1">
                    AI Analysis Failed
                  </div>
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Preview */}
          {prediction && !isLoading && !error && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                  ✅
                </div>
                <div>
                  <div className="font-semibold text-green-800 mb-1">
                    AI Analysis Complete
                  </div>
                  <div className="text-sm text-green-700">
                    Predicted grade: <strong>{prediction.metal_grade}</strong> • 
                    View detailed results below
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Prediction Results */}
      <AIPredictionResults 
        prediction={prediction}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

AIAnalysisSection.propTypes = {
  latestReading: PropTypes.shape({
    composition: PropTypes.object,
    metal_grade: PropTypes.string,
  }),
  isEnabled: PropTypes.bool,
};

export default AIAnalysisSection;
