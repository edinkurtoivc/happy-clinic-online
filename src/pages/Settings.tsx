
import { useState } from "react";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersManagement from "@/components/users/UsersManagement";
import ClinicInfo from "@/components/settings/ClinicInfo";
import UserRoles from "@/components/settings/UserRoles";
import ExaminationTypes from "@/components/settings/ExaminationTypes";

export default function Settings() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Postavke" />
      <div className="page-container">
        <Tabs defaultValue="clinic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="clinic">Informacije o praksi</TabsTrigger>
            <TabsTrigger value="users">Korisnici</TabsTrigger>
            <TabsTrigger value="roles">Role i permisije</TabsTrigger>
            <TabsTrigger value="examTypes">Vrste pregleda</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clinic">
            <ClinicInfo />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>
          
          <TabsContent value="roles">
            <UserRoles />
          </TabsContent>
          
          <TabsContent value="examTypes">
            <ExaminationTypes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
