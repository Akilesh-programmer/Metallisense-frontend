import axios from "axios";

// AI Prediction Service
class AIService {
  constructor() {
   this.baseURL = import.meta.env.VITE_AI_BASE_URL;
    this.timeout = 600000; // 60 seconds timeout for AI predictions
  }

  /**
   * Get AI prediction for metal composition
   * @param {Object} data - Prediction request data
   * @param {string} data.metal_grade - The metal grade
   * @param {Object} data.composition - Composition object with element names as keys
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

      if (
        typeof data.composition !== "object" ||
        data.composition === null ||
        Object.keys(data.composition).length === 0
      ) {
        throw new Error("Composition must be a non-empty object");
      }

      if (typeof data.kg !== "number" || data.kg <= 0) {
        throw new Error("kg must be a positive number");
      }

      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: false, // override global default
        timeout: this.timeout,
      };

      const response = await axios.post(
        `${this.baseURL}/predict`,
        {
          metal_grade: data.metal_grade,
          composition: data.composition,
          kg: data.kg,
        },
        config
      );

      console.log(response);

      // Standard success path
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("AI Prediction API Error:", error);

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Request timeout - AI service is taking too long to respond",
          type: "timeout",
        };
      }

      // If server returned a response (status != 2xx)
      if (error.response) {
        return {
          success: false,
          error:
            error.response.data?.message ||
            `Server error: ${error.response.status}`,
          data: error.response.data,
          type: "server_error",
          status: error.response.status,
        };
      }

      // Some CORS or network errors surface here even when the server
      // actually returned a body (browsers can treat it as a network error).
      if (error.request) {
        // Try to recover response text if present (XHR exposes responseText)
        try {
          const respText = error.request.responseText;
          if (respText) {
            const parsed = JSON.parse(respText);
            console.warn("Recovered AI response from XHR.responseText", parsed);
            return { success: true, data: parsed };
          }
        } catch (parseErr) {
          console.warn(
            "Failed to parse responseText from AI request",
            parseErr
          );
        }

        return {
          success: false,
          error: "Network error - Cannot reach AI service",
          type: "network_error",
        };
      }

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
      composition: reading.composition, // Send as object/map directly
      kg: kg,
    };
  }
}

// Export singleton instance
export default new AIService();
