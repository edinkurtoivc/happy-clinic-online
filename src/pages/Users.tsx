
import { useState } from "react";
import HeaderWithUserMenu from "@/components/layout/HeaderWithUserMenu";
import UsersManagement from "@/components/users/UsersManagement";

export default function Users() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return (
    <div className="flex h-full flex-col">
      <HeaderWithUserMenu 
        title="Upravljanje korisnicima" 
      />
      <div className="page-container">
        <UsersManagement />
      </div>
    </div>
  );
}
