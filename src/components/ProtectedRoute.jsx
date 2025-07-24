import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check authentication using the /users/me endpoint
      const response = await axios.get("/users/me");

      if (response.data.status === "success" && response.data.data.isLoggedIn) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      }
    } catch {
      // If request fails, user is not authenticated
      setIsAuthenticated(false);
      toast.error("Authentication required. Please login.");
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
