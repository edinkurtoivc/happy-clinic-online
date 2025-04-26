
import { useState } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MedicalReport } from "@/types/medical-report";

const formSchema = z.object({
  report: z.string().min(1, "Nalaz je obavezan"),
  therapy: z.string().min(1, "Terapija je obavezna"),
  notes: z.string().optional(),
  status: z.enum(["draft", "final"]),
});

interface MedicalReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<MedicalReport>) => void;
  defaultValues?: Partial<MedicalReport>;
}

export default function MedicalReportForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: MedicalReportFormProps) {
  const [status, setStatus] = useState<"draft" | "final">("draft");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report: defaultValues?.report || "",
      therapy: defaultValues?.therapy || "",
      notes: defaultValues?.notes || "",
      status: defaultValues?.status || "draft",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      date: new Date().toISOString(),
      status,
    });
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
