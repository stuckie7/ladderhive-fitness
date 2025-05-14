
import React from "react";
import AppRoutes from "./App.routes"; // This imports the routes we just updated
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
