
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/user";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default test users
const defaultUsers: User[] = [
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
  },
  {
    id: "4",
    email: "dr.kovac@klinika.com",
    firstName: "Emina",
    lastName: "Kovač",
    role: "doctor",
    specialization: "Neurologija",
    phone: "+38761222222",
    password: "doctor123",
    active: true,
  },
  {
    id: "5",
    email: "dr.begic@klinika.com",
    firstName: "Amir",
    lastName: "Begić",
    role: "doctor",
    specialization: "Ortopedija",
    phone: "+38761333333",
    password: "doctor123",
    active: true,
  },
  {
    id: "6",
    email: "tehnicar@klinika.com",
    firstName: "Haris",
    lastName: "Mujić",
    role: "nurse",
    phone: "+38761444444",
    password: "nurse123",
    active: true,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Temporarily set authentication to true by default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
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
      } catch (error) {
        console.error("[AuthContext] Error parsing current user:", error);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
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
      const user = users.find(
        (u: User) => u.email === email && u.password === password
      );

      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(user));
        
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
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
    toast({
      title: "Odjavili ste se",
      description: "Uspješno ste se odjavili iz sistema",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
