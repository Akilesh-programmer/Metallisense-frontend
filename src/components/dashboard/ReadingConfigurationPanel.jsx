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
        <div className="flex flex-wrap gap-3">
          {getAvailableElements().map((element) => (
            <button
              key={element}
              onClick={() => toggleDeviationElement(element)}
              className={`flex flex-col items-start px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex-shrink-0 ${
                deviationElements.includes(element)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              style={{ minWidth: 110 }}
              title={`${element}: ${formatRange(
                selectedGradeDetails.composition_range[element],
                2
              )}`}
            >
              <span className="font-semibold truncate w-full">{element}</span>
              <div className="text-xs opacity-75 whitespace-normal break-words w-full leading-tight">
                {formatRange(
                  selectedGradeDetails.composition_range[element],
                  2
                )}
              </div>
            </button>
          ))}
        </div>
      );
    } else if (selectedGrade) {
      return (
        <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-gray-600">
            Loading elements for {selectedGrade}...
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
          Please select a metal grade first to see available elements
        </div>
      );
    }
  };

  // Use centralized context for connection status
  const isConnected = isClientConnected;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 h-full flex flex-col w-full">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
        ⚙️ Configuration
      </h2>

      <div className="space-y-4 lg:space-y-5 flex-1 w-full">
        {/* Metal Grade Selection */}
        <div>
          <label
            htmlFor="metal-grade-select"
            className="block text-sm lg:text-base font-medium text-gray-700 mb-2"
          >
            Metal Grade
          </label>
          <select
            id="metal-grade-select"
            value={selectedGrade}
            onChange={(e) => handleGradeSelection(e.target.value)}
            className="w-full p-3 lg:p-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select a metal grade</option>
            {metalGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Deviation Percentage */}
        <div>
          <label
            htmlFor="deviation-percentage"
            className="block text-sm lg:text-base font-medium text-gray-700 mb-2"
          >
            Deviation Percentage (%)
          </label>
          <input
            id="deviation-percentage"
            type="number"
            min="0"
            max="50"
            value={deviationPercentage}
            onChange={(e) =>
              setDeviationPercentage(parseInt(e.target.value) || 0)
            }
            className="w-full p-3 lg:p-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter deviation percentage"
          />
        </div>

        {/* Total Weight */}
        <div>
          <label
            htmlFor="total-weight"
            className="block text-sm lg:text-base font-medium text-gray-700 mb-2"
          >
            Total Weight (kg)
          </label>
          <input
            id="total-weight"
            type="number"
            min="0"
            step="0.01"
            value={totalWeight}
            onChange={(e) => setTotalWeight(Number(e.target.value) || 0)}
            className="w-full p-3 lg:p-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter total weight in kilograms"
          />
        </div>
      </div>

      {/* Deviation Elements Selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Deviation Elements (Optional)
          {selectedGrade && (
            <span className="text-xs text-gray-500 ml-2">
              - Available elements in {selectedGrade}
            </span>
          )}
        </label>

        {renderElementsSection()}
      </div>

      {/* Generate Reading Button */}
      <div className="mt-6">
        <button
          onClick={generateReading}
          disabled={!selectedGrade || isGenerating || !isConnected}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            !selectedGrade || !isConnected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Reading...
            </div>
          ) : (
            "🔬 Generate Spectrometer Reading"
          )}
        </button>

        {/* Status Messages */}
        {!isConnected && selectedGrade && (
          <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded text-center">
            ⚠️ Connect to OPC Server to generate readings
          </div>
        )}
        {!selectedGrade && (
          <div className="mt-2 text-sm text-gray-500 text-center">
            Select a metal grade to proceed
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
