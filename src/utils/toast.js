import toast from "react-hot-toast";

// Custom toast utilities with consistent styling and behavior
export const toastUtils = {
  // Success messages
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
      ...options,
    });
  },

  // Error messages
  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      style: {
        background: "#ef4444",
        color: "#fff",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
      ...options,
    });
  },

  // Loading messages
  loading: (message, options = {}) => {
    return toast.loading(message, {
      style: {
        background: "#3b82f6",
        color: "#fff",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#3b82f6",
      },
      ...options,
    });
  },

  // Info messages
  info: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      icon: "ℹ️",
      style: {
        background: "#0ea5e9",
        color: "#fff",
        fontWeight: "500",
      },
      ...options,
    });
  },

  // Warning messages
  warning: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      icon: "⚠️",
      style: {
        background: "#f59e0b",
        color: "#fff",
        fontWeight: "500",
      },
      ...options,
    });
  },

  // Dismiss all toasts
  dismiss: () => {
    toast.dismiss();
  },

  // Promise-based toast (for async operations)
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || "Loading...",
        success: messages.success || "Success!",
        error: messages.error || "Something went wrong!",
      },
      {
        style: {
          fontWeight: "500",
        },
        success: {
          style: {
            background: "#10b981",
            color: "#fff",
          },
        },
        error: {
          style: {
            background: "#ef4444",
            color: "#fff",
          },
        },
        loading: {
          style: {
            background: "#3b82f6",
            color: "#fff",
          },
        },
        ...options,
      }
    );
  },
};

export default toastUtils;
