import axios from "axios";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export default axios;
