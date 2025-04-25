
import { useState } from "react";
import Header from "@/components/layout/Header";
import UsersManagement from "@/components/users/UsersManagement";

export default function Users() {
  return (
    <div className="flex h-full flex-col">
      <Header 
        title="User Management" 
        action={{
          label: "Add User",
          onClick: () => {/* Will implement with Supabase */}
        }}
      />
      <div className="page-container">
        <UsersManagement />
      </div>
    </div>
  );
}
