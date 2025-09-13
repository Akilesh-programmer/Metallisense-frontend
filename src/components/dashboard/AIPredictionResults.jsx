import React from "react";
import PropTypes from "prop-types";

function AIPredictionResults({ prediction, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="modern-card p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              🤖 AI Analysis in Progress
            </h3>
            <p className="text-gray-600 mb-4">
              Our AI is analyzing your metal composition...
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                ⏱️ This typically takes 30-60 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-card p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              AI Prediction Failed
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                💡 Try again in a few moments, or check your network connection
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const { metal_grade, adjustments, recommendations } = prediction;

  // Categorize adjustments by action type
  const adjustmentsByType = {
    reduce: [],
    ok: [],
    increase: [],
  };

  Object.entries(adjustments || {}).forEach(([element, action]) => {
    if (action.toLowerCase().includes("reduce")) {
      adjustmentsByType.reduce.push({ element, action });
    } else if (action.toLowerCase() === "ok") {
      adjustmentsByType.ok.push({ element, action });
    } else {
      adjustmentsByType.increase.push({ element, action });
    }
  });

  return (
    <div className="modern-card p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold gradient-text flex items-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mr-3 animate-pulse"></div>
          🤖 AI Predictions & Recommendations
        </h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Generated just now
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Predicted Metal Grade & Summary */}
        <div className="space-y-6">
          {/* Predicted Metal Grade */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-100 text-sm font-medium mb-1">
                  AI Predicted Grade
                </div>
                <div className="text-3xl font-bold">{metal_grade}</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-4 text-white shadow-lg">
              <div className="text-red-100 text-xs font-medium mb-1">
                Reduce
              </div>
              <div className="text-2xl font-bold">
                {adjustmentsByType.reduce.length}
              </div>
              <div className="text-xs text-red-100 mt-1">elements</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-4 text-white shadow-lg">
              <div className="text-green-100 text-xs font-medium mb-1">OK</div>
              <div className="text-2xl font-bold">
                {adjustmentsByType.ok.length}
              </div>
              <div className="text-xs text-green-100 mt-1">elements</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white shadow-lg">
              <div className="text-blue-100 text-xs font-medium mb-1">
                Increase
              </div>
              <div className="text-2xl font-bold">
                {adjustmentsByType.increase.length}
              </div>
              <div className="text-xs text-blue-100 mt-1">elements</div>
            </div>
          </div>

          {/* Adjustments Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-3 text-2xl">⚖️</span>
              Required Adjustments
            </h3>

            <div className="space-y-4">
              {/* Reduce Elements */}
              {adjustmentsByType.reduce.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-700 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Reduce ({adjustmentsByType.reduce.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {adjustmentsByType.reduce.map(({ element, action }) => (
                      <div
                        key={element}
                        className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                      >
                        <div className="font-semibold text-red-800 text-sm">
                          {element}
                        </div>
                        <div className="text-xs text-red-600">{action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OK Elements */}
              {adjustmentsByType.ok.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-green-700 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Within Specs ({adjustmentsByType.ok.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {adjustmentsByType.ok.map(({ element }) => (
                      <div
                        key={element}
                        className="bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                      >
                        <div className="font-semibold text-green-800 text-sm">
                          {element}
                        </div>
                        <div className="text-xs text-green-600">✓ OK</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Increase Elements */}
              {adjustmentsByType.increase.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-blue-700 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Increase ({adjustmentsByType.increase.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {adjustmentsByType.increase.map(({ element, action }) => (
                      <div
                        key={element}
                        className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                      >
                        <div className="font-semibold text-blue-800 text-sm">
                          {element}
                        </div>
                        <div className="text-xs text-blue-600">{action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Recommendations */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-2xl">💡</span>
              AI Recommendations
              <div className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {Object.keys(recommendations || {}).length} Suggestions
              </div>
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(recommendations || {}).map(
                ([element, recommendation]) => {
                  // Determine recommendation type for styling
                  const isReduce = adjustmentsByType.reduce.some(
                    (adj) => adj.element === element
                  );
                  const isIncrease = adjustmentsByType.increase.some(
                    (adj) => adj.element === element
                  );
                  const isOk = adjustmentsByType.ok.some(
                    (adj) => adj.element === element
                  );

                  let bgColor = "bg-gray-50 border-gray-200";
                  let textColor = "text-gray-700";
                  let badgeColor = "bg-gray-100 text-gray-600";

                  if (isReduce) {
                    bgColor = "bg-red-50 border-red-200";
                    textColor = "text-red-700";
                    badgeColor = "bg-red-100 text-red-600";
                  } else if (isIncrease) {
                    bgColor = "bg-blue-50 border-blue-200";
                    textColor = "text-blue-700";
                    badgeColor = "bg-blue-100 text-blue-600";
                  } else if (isOk) {
                    bgColor = "bg-green-50 border-green-200";
                    textColor = "text-green-700";
                    badgeColor = "bg-green-100 text-green-600";
                  }

                  return (
                    <div
                      key={element}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${bgColor}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${textColor}`}>
                            {element}
                          </span>
                          <span
                            className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${badgeColor}`}
                          >
                            {(() => {
                              if (isReduce) return "REDUCE";
                              if (isIncrease) return "INCREASE";
                              return "OK";
                            })()}
                          </span>
                        </div>
                      </div>

                      <p className={`text-sm ${textColor} leading-relaxed`}>
                        {recommendation}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Summary Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white mr-4">
              🎯
            </div>
            <div>
              <div className="font-semibold text-purple-800 text-lg">
                AI Analysis Complete
              </div>
              <div className="text-sm text-purple-600 mt-1">
                Target grade: <strong>{metal_grade}</strong> •
                {adjustmentsByType.reduce.length +
                  adjustmentsByType.increase.length}{" "}
                adjustments needed •{adjustmentsByType.ok.length} elements
                within specifications
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

AIPredictionResults.propTypes = {
  prediction: PropTypes.shape({
    metal_grade: PropTypes.string,
    adjustments: PropTypes.objectOf(PropTypes.string),
    recommendations: PropTypes.objectOf(PropTypes.string),
  }),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default AIPredictionResults;
