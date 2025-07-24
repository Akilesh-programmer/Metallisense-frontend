import React from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";

function MainDashboard() {
  const handleLogout = async () => {
    // Show loading toast
    const loadingToast = toast.loading("Logging out...");

    try {
      await axios.post("/users/logout");

      // Success toast
      toast.success("Logged out successfully!", {
        id: loadingToast,
        duration: 2000,
      });

      // Small delay to show the success message before redirect
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      console.error("Logout failed:", error);

      // Error toast
      toast.error("Logout failed, but redirecting anyway...", {
        id: loadingToast,
        duration: 2000,
      });

      // Even if logout fails, redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            MetalliSense Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            AI-Driven Alloy Addition System
          </h2>
          <p className="text-gray-600">
            Welcome to the MetalliSense Dashboard. This is where you'll manage
            spectrometer connections, metal grades, and AI-driven alloy
            recommendations.
          </p>

          {/* Placeholder for future features */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <p className="text-blue-800 font-medium">
              🚧 Dashboard features will be implemented next:
            </p>
            <ul className="mt-2 text-blue-700 list-disc list-inside">
              <li>Spectrometer connection management</li>
              <li>Metal grades selection</li>
              <li>Real-time data display</li>
              <li>AI recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
