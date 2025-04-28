
import { useState } from "react";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClinicInfo from "@/components/settings/ClinicInfo";
import ExaminationTypes from "@/components/settings/ExaminationTypes";
import UsersManagement from "@/components/users/UsersManagement";
import DataFolderSelect from "@/components/settings/DataFolderSelect";
import BackupRestore from "@/components/settings/BackupRestore";
import AppearanceSettings from "@/components/settings/AppearanceSettings";

export default function Settings() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Postavke" />
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClinicInfo />
          <ExaminationTypes />
          <UsersManagement />
          <DataFolderSelect />
          <BackupRestore />
          <AppearanceSettings />
        </div>
      </div>
    </div>
  );
}
