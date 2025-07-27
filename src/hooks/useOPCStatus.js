import { useContext } from "react";
import OPCStatusContext from "../contexts/OPCStatusContext";

export const useOPCStatus = () => {
  const context = useContext(OPCStatusContext);
  if (!context) {
    throw new Error("useOPCStatus must be used within an OPCStatusProvider");
  }
  return context;
};
