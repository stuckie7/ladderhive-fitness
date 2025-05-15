
import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./App.routes"; // This imports the routes we just updated
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
