
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import MedicalReports from "./pages/MedicalReports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    console.log("Protected route check, authenticated:", isAuthenticated);
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  );
};

// App Router with Auth Provider
const AppRoutes = () => {
  useEffect(() => {
    // Initialize default users if none exist
    const usersString = localStorage.getItem('users');
    if (!usersString) {
      const defaultUsers = [
        {
          id: "1",
          email: "dr.smith@klinika.com",
          firstName: "Adnan",
          lastName: "Hadžić",
          role: "doctor",
          specialization: "Kardiologija",
          phone: "+38761123456",
          password: "doctor123",
          active: true,
        },
        {
          id: "2",
          email: "admin@klinika.com",
          firstName: "Amina",
          lastName: "Selimović",
          role: "admin",
          phone: "+38761654321",
          password: "admin123",
          active: true,
        },
        {
          id: "3",
          email: "superadmin@klinika.com",
          firstName: "Super",
          lastName: "Admin",
          role: "admin",
          phone: "+38761111111",
          password: "superadmin123",
          active: true,
        }
      ];
      
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      console.log("Default users initialized");
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/medical-reports" element={<ProtectedRoute><MedicalReports /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
