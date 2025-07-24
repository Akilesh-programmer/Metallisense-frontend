import axios from '../utils/axios';

export const dashboardAPI = {
  // Metal Grades APIs
  async getMetalGradeNames() {
    try {
      const response = await axios.get('/metal-grades/names');
      return response.data;
    } catch (error) {
      console.error('Error fetching metal grade names:', error);
      throw error;
    }
  },

  async getMetalGradeByName(name) {
    try {
      const response = await axios.post('/metal-grades/by-name', { name });
      return response.data;
    } catch (error) {
      console.error('Error fetching metal grade details:', error);
      throw error;
    }
  },

  // Spectrometer APIs
  async connectSpectrometer() {
    try {
      console.log('Attempting to connect to spectrometer...');
      const response = await axios.post('/spectrometer/connect');
      console.log('Spectrometer connection response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error connecting to spectrometer:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  },

  async disconnectSpectrometer() {
    try {
      const response = await axios.post('/spectrometer/disconnect');
      return response.data;
    } catch (error) {
      console.error('Error disconnecting from spectrometer:', error);
      throw error;
    }
  },

  async updateSpectrometerConfig(metalGrade, incorrectElementsCount) {
    try {
      console.log('Updating spectrometer config:', { metalGrade, incorrectElementsCount });
      const response = await axios.put('/spectrometer/config', {
        metalGrade,
        incorrectElementsCount
      });
      console.log('Config update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating spectrometer config:', error);
      console.error('Config update error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        requestData: { metalGrade, incorrectElementsCount }
      });
      throw error;
    }
  },

  async getLatestReading() {
    try {
      const response = await axios.get('/spectrometer/latest-reading');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest reading:', error);
      throw error;
    }
  }
};

export default dashboardAPI;
