
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import UsersManagement from "@/components/users/UsersManagement";
import { useToast } from "@/hooks/use-toast";

export default function Users() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  // Provjerite učitavanje korisnika pri inicijalizaciji
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        console.log("[Users] Found users in localStorage:", users.length);
      } else {
        console.log("[Users] No users found in localStorage");
      }
    } catch (error) {
      console.error("[Users] Error checking users:", error);
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Upravljanje korisnicima" 
        action={{
          label: "Dodaj korisnika",
          onClick: () => setIsFormOpen(true)
        }}
      />
      <div className="page-container">
        <UsersManagement />
      </div>
    </div>
  );
}
