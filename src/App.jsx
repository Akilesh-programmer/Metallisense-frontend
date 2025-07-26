import React from "react";
import "./App.css";
import LoginForm from "./views/LoginForm";
import RegisterForm from "./views/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected Routes - Add your main component here */}
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                      Welcome to MetalliSense
                    </h1>
                    <p className="text-gray-600">
                      Main application will be loaded here
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: "",
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              padding: "12px 16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            // Default options for specific types
            success: {
              duration: 3000,
              style: {
                background: "#10b981",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#10b981",
              },
            },
            error: {
              duration: 5000,
              style: {
                background: "#ef4444",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#ef4444",
              },
            },
            loading: {
              style: {
                background: "#3b82f6",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#3b82f6",
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
