
import { useState } from "react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import DoctorsStatistics from "@/components/statistics/DoctorsStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopExaminationTypes from "@/components/statistics/TopExaminationTypes";
import PatientDemographics from "@/components/statistics/PatientDemographics";

export default function Statistics() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Statistika" />
      <div className="page-container">
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="doctors">Doktori i Pregledi</TabsTrigger>
            <TabsTrigger value="examinations">Top Vrste Pregleda</TabsTrigger>
            <TabsTrigger value="demographics">Demografija Pacijenata</TabsTrigger>
          </TabsList>
          
          <TabsContent value="doctors" className="space-y-6">
            <DoctorsStatistics />
          </TabsContent>
          
          <TabsContent value="examinations" className="space-y-6">
            <TopExaminationTypes />
          </TabsContent>
          
          <TabsContent value="demographics" className="space-y-6">
            <PatientDemographics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
