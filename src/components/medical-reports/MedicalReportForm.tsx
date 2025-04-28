
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MedicalReport, ExaminationType } from "@/types/medical-report";

const formSchema = z.object({
  report: z.string().min(1, "Nalaz je obavezan"),
  therapy: z.string().min(1, "Terapija je obavezna"),
  notes: z.string().optional(),
  status: z.enum(["draft", "final"]),
  appointmentType: z.string().min(1, "Vrsta pregleda je obavezna"),
});

interface MedicalReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<MedicalReport>) => void;
  defaultValues?: Partial<MedicalReport>;
  examinationTypes: ExaminationType[];
}

export default function MedicalReportForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  examinationTypes,
}: MedicalReportFormProps) {
  const [status, setStatus] = useState<"draft" | "final">("draft");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report: defaultValues?.report || "",
      therapy: defaultValues?.therapy || "",
      notes: defaultValues?.notes || "",
      status: defaultValues?.status || "draft",
      appointmentType: defaultValues?.appointmentType || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const reportData = {
      ...values,
      date: new Date().toISOString(),
      status,
      verificationStatus: status === "final" ? "pending" : "unverified",
    };

    // Save to patient history as well
    const patientHistoryEntry = {
      id: Date.now(),
      patientId: defaultValues?.patientId || 0,
      date: new Date().toISOString(),
      type: values.appointmentType,
      doctor: defaultValues?.doctorInfo?.fullName || "",
      reportId: defaultValues?.id,
    };

    // Save patient history entry
    const existingHistory = localStorage.getItem('patientHistory') || '[]';
    const historyArray = JSON.parse(existingHistory);
    historyArray.push(patientHistoryEntry);
    localStorage.setItem('patientHistory', JSON.stringify(historyArray));

    onSubmit(reportData);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Medicinski nalaz</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="appointmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vrsta pregleda</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Izaberite vrstu pregleda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {examinationTypes.map(type => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="report"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nalaz</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Unesite nalaz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="therapy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terapija</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Unesite terapiju" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dodatne napomene</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Unesite dodatne napomene (opcionalno)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStatus("draft");
                    form.handleSubmit(handleSubmit)();
                  }}
                >
                  Sačuvaj kao nacrt
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setStatus("final");
                    form.handleSubmit(handleSubmit)();
                  }}
                >
                  Finaliziraj nalaz
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
