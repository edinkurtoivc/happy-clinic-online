
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log("[AuthContext] User loaded from localStorage:", parsedUser.email);
      } catch (error) {
        console.error("[AuthContext] Error parsing user from localStorage:", error);
        localStorage.removeItem("currentUser");
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
