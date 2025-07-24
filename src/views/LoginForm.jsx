import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    // Show loading toast
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await axios.post("/users/login", {
        email,
        password,
      });

      if (response.data.status === "success") {
        // Success toast
        toast.success("Login successful! Welcome back!", {
          id: loadingToast,
        });

        // Redirect to dashboard on successful login
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);

      // Error toast
      const errorMessage =
        err.response?.data?.error?.message || "Login failed. Please try again.";
      toast.error(errorMessage, {
        id: loadingToast,
      });

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen max-w-screen flex items-center justify-center">
      <div className="relative w-[420px] shadow-lg rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-white"></div>
          <div className="w-1/2 bg-sky-200"></div>
        </div>
        <form className="relative z-10 p-8" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-center mb-8 text-red-800">
            Login
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <label className="flex flex-col items-start gap-2">
              <span className="text-lg font-medium text-blue-300">Email</span>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="p-4 backdrop-blur-2xl border border-gray-500 rounded-md focus:outline-none w-full"
                required
              />
            </label>
            <label className="flex flex-col items-start gap-2">
              <span className="text-lg font-medium text-blue-300">
                Password
              </span>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                className="p-4 backdrop-blur-2xl border border-gray-500 rounded-md focus:outline-none w-full"
                required
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 py-3 px-6 bg-gradient-to-r from-blue-400 via-pink-400 to-red-400 text-white font-semibold rounded-md shadow hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <div>
              <h1>Don't have an account?</h1>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
