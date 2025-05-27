
import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./App.routes"; 
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminProvider>
            <RouterProvider router={router} />
            <Toaster />
          </AdminProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
