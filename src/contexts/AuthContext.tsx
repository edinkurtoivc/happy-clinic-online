import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole } from "@/types/user";
import * as bcrypt from 'bcryptjs';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  isLoadingAuth: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default test users with hashed passwords
const defaultUsers: User[] = [
  {
    id: "USR001",
    email: "dr.smith@klinika.com",
    firstName: "Adnan",
    lastName: "Hadžić",
    role: "doctor",
    specialization: "Kardiologija",
    phone: "+38761123456",
    password: "$2a$10$KvwR4nMOa6BIgFmIVneeguBYRNNFYxRh9kKqZN1Hl2wYRJJfXVA5q", // doctor123
    active: true,
  },
  {
    id: "USR002",
    email: "admin@klinika.com",
    firstName: "Amina",
    lastName: "Selimović",
    role: "admin",
    phone: "+38761654321",
    password: "$2a$10$BBJUo6ZUYlz3jm7xQgDD5.FR/GRPXFDJibF1.6P5r/OJlO76Durha", // admin123
    active: true,
  },
  {
    id: "USR003",
    email: "superadmin@klinika.com",
    firstName: "Super",
    lastName: "Admin",
    role: "admin",
    phone: "+38761111111",
    password: "$2a$10$T3ZGu7WGcEtNYm8F2ZsCoe2P5zLuQzUXvyEFsHwHOCRA8UwJl/YZC", // superadmin123
    active: true,
  },
  {
    id: "USR004",
    email: "dr.kovac@klinika.com",
    firstName: "Emina",
    lastName: "Kovač",
    role: "doctor",
    specialization: "Neurologija",
    phone: "+38761222222",
    password: "$2a$10$KvwR4nMOa6BIgFmIVneeguBYRNNFYxRh9kKqZN1Hl2wYRJJfXVA5q", // doctor123
    active: true,
  },
  {
    id: "USR005",
    email: "dr.begic@klinika.com",
    firstName: "Amir",
    lastName: "Begić",
    role: "doctor",
    specialization: "Ortopedija",
    phone: "+38761333333",
    password: "$2a$10$KvwR4nMOa6BIgFmIVneeguBYRNNFYxRh9kKqZN1Hl2wYRJJfXVA5q", // doctor123
    active: true,
  },
  {
    id: "USR006",
    email: "tehnicar@klinika.com",
    firstName: "Haris",
    lastName: "Mujić",
    role: "nurse",
    phone: "+38761444444",
    password: "$2a$10$YpM2Jf2TXt/9C6gkRJXfOOEq0Evs4xnbzFK1OmYc/2PLm4qXxdTLu", // nurse123
    active: true,
  },
];

// Function to log user activity
const logUserActivity = (user: User | null, action: string): void => {
  if (!user) return;
  
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `[${timestamp}] ${user.id} (${user.role}) ${action}`;
  
  console.log("[AuditLog]", logEntry);
  
  // In a real app, this would write to a file or database
  const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  existingLogs.push(logEntry);
  localStorage.setItem('auditLogs', JSON.stringify(existingLogs));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize users and load current user from localStorage on mount
  useEffect(() => {
    // Check if users exist in localStorage
    const storedUsers = localStorage.getItem("users");
    
    // If no users in localStorage, set default users
    if (!storedUsers) {
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      console.log("[AuthContext] Initialized default users");
    }
    
    // Load current user from localStorage if exists
    const currentUserData = localStorage.getItem("currentUser");
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log("[AuthContext] Loaded user from localStorage:", parsedUser.email);
        logUserActivity(parsedUser, "se prijavio u aplikaciju (nastavak sesije)");
      } catch (error) {
        console.error("[AuthContext] Error parsing current user:", error);
      }
    }
    
    setIsLoadingAuth(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoadingAuth(true);
      const usersString = localStorage.getItem("users");
      if (!usersString) {
        toast({
          title: "Greška",
          description: "Nema registrovanih korisnika",
          variant: "destructive",
        });
        return false;
      }

      const users = JSON.parse(usersString);
      const user = users.find((u: User) => u.email === email);

      if (!user) {
        toast({
          title: "Greška",
          description: "Pogrešan email ili šifra",
          variant: "destructive",
        });
        return false;
      }
      
      // If user is not active
      if (!user.active) {
        toast({
          title: "Pristup odbijen",
          description: "Vaš korisnički račun nije aktivan. Kontaktirajte administratora.",
          variant: "destructive",
        });
        return false;
      }

      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // Create a clean user object without the password
        const cleanUser = { ...user };
        delete cleanUser.password;
        
        setUser(cleanUser);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(cleanUser));
        
        logUserActivity(cleanUser, "se prijavio u aplikaciju");
        
        toast({
          title: "Uspješna prijava",
          description: `Dobrodošli, ${user.firstName}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Greška",
          description: "Pogrešan email ili šifra",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom prijave",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    if (user) {
      logUserActivity(user, "se odjavio iz aplikacije");
    }
    
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
    toast({
      title: "Odjavili ste se",
      description: "Uspješno ste se odjavili iz sistema",
    });
    navigate("/login");
  };
  
  // Helper function to check if user has permission based on role
  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // If requiredRole is an array, check if user's role is in the array
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    // Otherwise, check if user's role matches the required role
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      hasPermission,
      isLoadingAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
