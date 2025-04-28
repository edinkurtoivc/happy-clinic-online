
import { useState } from "react";
import HeaderWithUserMenu from "@/components/layout/HeaderWithUserMenu";
import { Card } from "@/components/ui/card";
import DoctorsStatistics from "@/components/statistics/DoctorsStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopExaminationTypes from "@/components/statistics/TopExaminationTypes";

export default function Statistics() {
  return (
    <div className="flex h-full flex-col">
      <HeaderWithUserMenu title="Statistika" />
      <div className="page-container">
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="doctors">Doktori i Pregledi</TabsTrigger>
            <TabsTrigger value="examinations">Top Vrste Pregleda</TabsTrigger>
          </TabsList>
          
          <TabsContent value="doctors" className="space-y-6">
            <DoctorsStatistics />
          </TabsContent>
          
          <TabsContent value="examinations" className="space-y-6">
            <TopExaminationTypes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
