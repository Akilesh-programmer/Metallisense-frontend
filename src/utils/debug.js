// Debug utility to help troubleshoot connection issues
export const debugUtils = {
  // Check if backend is reachable
  async checkBackendHealth() {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      console.log('🔍 Checking backend health at:', baseUrl);
      
      const response = await fetch(`${baseUrl.replace('/api/v1', '')}/health`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Backend is reachable');
        return true;
      } else {
        console.log('❌ Backend returned status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend is not reachable:', error.message);
      return false;
    }
  },

  // Log environment variables
  logEnvironment() {
    console.log('🌍 Environment Variables:');
    console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);
    console.log('Socket URL would be:', import.meta.env.VITE_BASE_URL?.replace('/api/v1', ''));
  },

  // Test API endpoints
  async testEndpoints() {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const endpoints = [
      '/users/me',
      '/metal-grades/names',
      '/spectrometer/connect'
    ];

    console.log('🧪 Testing API endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: endpoint === '/spectrometer/connect' ? 'POST' : 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`${endpoint}: ❌ ${error.message}`);
      }
    }
  }
};

export default debugUtils;
