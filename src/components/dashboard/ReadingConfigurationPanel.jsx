import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useOPCStatus } from "../../hooks/useOPCStatus";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { formatRange } from "../../utils/formatters";

function ReadingConfigurationPanel({
  onReadingGenerated,
  onGenerationStart,
  onGenerationError,
  isGenerating,
  onGradeDetailsChange,
}) {
  // Use centralized OPC status context
  const { isClientConnected } = useOPCStatus();

  const [metalGrades, setMetalGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGradeDetails, setSelectedGradeDetails] = useState(null);
  const [deviationElements, setDeviationElements] = useState([]);
  const [deviationPercentage, setDeviationPercentage] = useState(10);
  const [totalWeight, setTotalWeight] = useState(1);

  // Load initial data
  useEffect(() => {
    fetchMetalGrades();
  }, []);

  // Fetch available metal grades
  const fetchMetalGrades = async () => {
    try {
      const response = await axios.get("/metal-grades/names");
      if (response.data.status === "success") {
        setMetalGrades(response.data.data.gradeNames);
      }
    } catch (error) {
      console.error("Failed to fetch metal grades:", error);
      toast.error("Failed to load metal grades");
    }
  };

  // Fetch detailed metal grade information
  const fetchMetalGradeDetails = async (gradeName) => {
    try {
      const response = await axios.post("/metal-grades/by-name", {
        name: gradeName,
      });
      if (response.data.status === "success") {
        const details = response.data.data.metalGrade;
        setSelectedGradeDetails(details);
        if (onGradeDetailsChange) onGradeDetailsChange(details);
        setDeviationElements([]);
      }
    } catch (error) {
      console.error("Failed to fetch metal grade details:", error);
      toast.error("Failed to load metal grade details");
      setSelectedGradeDetails(null);
      if (onGradeDetailsChange) onGradeDetailsChange(null);
    }
  };

  // Handle metal grade selection change
  const handleGradeSelection = async (gradeName) => {
    setSelectedGrade(gradeName);
    if (gradeName) {
      await fetchMetalGradeDetails(gradeName);
    } else {
      setSelectedGradeDetails(null);
      setDeviationElements([]);
      if (onGradeDetailsChange) onGradeDetailsChange(null);
    }
  };

  // Handle deviation element selection
  const toggleDeviationElement = (element) => {
    setDeviationElements((prev) =>
      prev.includes(element)
        ? prev.filter((e) => e !== element)
        : [...prev, element]
    );
  };

  // Get available elements from selected grade details
  const getAvailableElements = () => {
    if (!selectedGradeDetails?.composition_range) {
      return [];
    }
    return Object.keys(selectedGradeDetails.composition_range);
  };

  // Generate new spectrometer reading
  const generateReading = async () => {
    // Validation checks
    if (!selectedGrade) {
      toast.error("Please select a metal grade first");
      return;
    }

    // Check OPC connection status
    if (!isClientConnected) {
      toast.error(
        "Please connect to OPC Server first before generating readings"
      );
      return;
    }

    // Notify parent component that generation has started
    if (onGenerationStart) {
      onGenerationStart();
    }

    try {
      const requestBody = {
        metalGrade: selectedGrade,
        deviationPercentage: deviationPercentage,
        totalWeight: totalWeight,
      };

      if (deviationElements.length > 0) {
        requestBody.deviationElements = deviationElements;
      }

      const response = await axios.post(
        "/spectrometer/opc-reading",
        requestBody
      );

      if (response.data.status === "success") {
        const reading = response.data.data.reading;
        toast.success("🔬 Spectrometer reading generated successfully!");

        // Notify parent component about new reading
        if (onReadingGenerated) {
          onReadingGenerated(reading);
        }
      }
    } catch (error) {
      console.error("Failed to generate reading:", error);
      const errorMessage =
        error.response?.data?.error?.message || "Failed to generate reading";
      toast.error(errorMessage);

      // Notify parent component of error
      if (onGenerationError) {
        onGenerationError();
      }
    }
  };

  const renderElementsSection = () => {
    if (selectedGradeDetails?.composition_range) {
      return (
        <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {getAvailableElements().map((element) => (
              <button
                key={element}
                onClick={() => toggleDeviationElement(element)}
                className={`p-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 border-2 ${
                  deviationElements.includes(element)
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-300 shadow-lg"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                title={`${element}: ${formatRange(
                  selectedGradeDetails.composition_range[element],
                  2
                )}`}
              >
                <div className="font-bold text-lg">{element}</div>
                <div className="text-xs opacity-75 mt-1">
                  {formatRange(
                    selectedGradeDetails.composition_range[element],
                    2
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    } else if (selectedGrade) {
      return (
        <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mr-3"></div>
          <span className="text-blue-700 font-medium">
            Loading elements for {selectedGrade}...
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-center py-6 text-gray-500 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-medium">
            Select a metal grade to see available elements
          </div>
        </div>
      );
    }
  };

  // Use centralized context for connection status
  const isConnected = isClientConnected;

  return (
    <div className="modern-card p-6">
      <h2 className="text-xl font-bold gradient-text mb-6 flex items-center">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 mr-3 animate-pulse"></div>
        ⚙️ Configuration
      </h2>

      <div className="space-y-6 flex-1">
        {/* Metal Grade Selection */}
        <div className="space-y-2">
          <label
            htmlFor="metal-grade-select"
            className="flex items-center text-sm font-semibold text-gray-800"
          >
            <span className="mr-2">🏭</span>
            Metal Grade
          </label>
          <select
            id="metal-grade-select"
            value={selectedGrade}
            onChange={(e) => handleGradeSelection(e.target.value)}
            className="w-full p-4 text-base border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
          >
            <option value="">Choose a metal grade...</option>
            {metalGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Deviation Percentage */}
          <div className="space-y-2">
            <label
              htmlFor="deviation-percentage"
              className="flex items-center text-sm font-semibold text-gray-800"
            >
              <span className="mr-2">📊</span>
              Deviation %
            </label>
            <div className="relative">
              <input
                id="deviation-percentage"
                type="number"
                min="0"
                max="50"
                value={deviationPercentage}
                onChange={(e) =>
                  setDeviationPercentage(parseInt(e.target.value) || 0)
                }
                className="w-full p-4 text-base border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="0-50"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Total Weight */}
          <div className="space-y-2">
            <label
              htmlFor="total-weight"
              className="flex items-center text-sm font-semibold text-gray-800"
            >
              Total Weight
            </label>
            <div className="relative">
              <input
                id="total-weight"
                type="number"
                min="0"
                step="0.01"
                value={totalWeight}
                onChange={(e) => setTotalWeight(Number(e.target.value) || 0)}
                className="w-full p-4 text-base border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-400 text-sm">kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deviation Elements Selection */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            🧪 Deviation Elements
          </label>
          {selectedGrade && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedGrade}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600 mb-3">
          Select elements to apply deviation during analysis (optional)
        </div>

        {renderElementsSection()}
      </div>

      {/* Generate Reading Button */}
      <div className="mt-8 space-y-3">
        <button
          onClick={generateReading}
          disabled={!selectedGrade || isGenerating || !isConnected}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform ${
            !selectedGrade || !isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:scale-105"
          } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
              Generating Reading...
            </div>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-3 text-xl">🔬</span>
              Generate Spectrometer Reading
            </span>
          )}
        </button>

        {/* Status Messages */}
        {!isConnected && selectedGrade && (
          <div className="text-sm text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-3 rounded-xl flex items-center">
            <span className="mr-2">⚠️</span>
            <span className="font-medium">
              Connect to OPC Server to generate readings
            </span>
          </div>
        )}
        {!selectedGrade && (
          <div className="text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 p-3 rounded-xl text-center">
            👆 Select a metal grade to proceed
          </div>
        )}
      </div>
    </div>
  );
}

// PropTypes validation
ReadingConfigurationPanel.propTypes = {
  onReadingGenerated: PropTypes.func.isRequired,
  onGenerationStart: PropTypes.func,
  onGenerationError: PropTypes.func,
  isGenerating: PropTypes.bool,
  onGradeDetailsChange: PropTypes.func,
};

export default ReadingConfigurationPanel;
