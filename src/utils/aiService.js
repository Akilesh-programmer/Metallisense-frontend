import axios from "axios";

// AI Prediction Service
class AIService {
  constructor() {
    this.baseURL = "https://metallisense-ai.onrender.com";
    this.timeout = 60000; // 60 seconds timeout for AI predictions
  }

  /**
   * Get AI prediction for metal composition
   * @param {Object} data - Prediction request data
   * @param {string} data.metal_grade - The metal grade
   * @param {Array<number>} data.composition - Array of composition values
   * @param {number} data.kg - Weight in kg
   * @returns {Promise<Object>} AI prediction response
   */
  async getPrediction(data) {
    try {
      // Validate input data
      if (!data.metal_grade || !data.composition || !data.kg) {
        throw new Error(
          "Missing required fields: metal_grade, composition, or kg"
        );
      }

      if (!Array.isArray(data.composition) || data.composition.length === 0) {
        throw new Error("Composition must be a non-empty array");
      }

      if (typeof data.kg !== "number" || data.kg <= 0) {
        throw new Error("kg must be a positive number");
      }

      const response = await axios.post(
        `${this.baseURL}/predict/`,
        {
          metal_grade: data.metal_grade,
          composition: data.composition,
          kg: data.kg,
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("AI Prediction API Error:", error);

      // Handle different types of errors
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Request timeout - AI service is taking too long to respond",
          type: "timeout",
        };
      }

      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error:
            error.response.data?.message ||
            `Server error: ${error.response.status}`,
          type: "server_error",
          status: error.response.status,
        };
      }

      if (error.request) {
        // Network error
        return {
          success: false,
          error: "Network error - Cannot reach AI service",
          type: "network_error",
        };
      }

      // Other errors (validation, etc.)
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        type: "validation_error",
      };
    }
  }

  /**
   * Check if AI service is available
   * @returns {Promise<boolean>} Service availability status
   */
  async checkServiceStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.warn("AI Service health check failed:", error.message);
      return false;
    }
  }

  /**
   * Transform composition object to array format expected by AI
   * @param {Object} compositionObj - Composition object with element names as keys
   * @returns {Array<number>} Array of composition values
   */
  transformCompositionToArray(compositionObj) {
    // Define standard element order for AI model
    const standardElements = [
      "Fe",
      "C",
      "Si",
      "Mn",
      "P",
      "S",
      "Cr",
      "Ni",
      "Mo",
      "Cu",
      "V",
      "Ti",
      "Nb",
      "Mg",
    ];

    return standardElements.map((element) => {
      return compositionObj[element] || 0;
    });
  }

  /**
   * Create prediction request from spectrometer reading
   * @param {Object} reading - Spectrometer reading data
   * @param {number} kg - Weight for prediction
   * @returns {Object} Formatted prediction request
   */
  createPredictionRequest(reading, kg = 10) {
    if (!reading || !reading.composition) {
      throw new Error("Invalid reading data - missing composition");
    }

    return {
      metal_grade: reading.metal_grade || "UNKNOWN",
      composition: this.transformCompositionToArray(reading.composition),
      kg: kg,
    };
  }
}

// Export singleton instance
export default new AIService();
