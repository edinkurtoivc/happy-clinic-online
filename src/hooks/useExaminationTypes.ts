import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import dataStorageService from "@/services/DataStorageService";
import type { ExaminationType } from "@/types/medical-report";

export function useExaminationTypes() {
  const { toast } = useToast();
  const [examTypes, setExamTypes] = useState<ExaminationType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const types = await dataStorageService.getExaminationTypes();
      setExamTypes(types || []);
    } catch (error) {
      console.error("[useExaminationTypes] Failed to load types", error);
      toast({
        title: "Greška",
        description: "Neuspjelo učitavanje vrsta pregleda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveTypes = useCallback(async (types: ExaminationType[]) => {
    setExamTypes(types);
    const ok = await dataStorageService.saveExaminationTypes(types);
    if (!ok) {
      toast({
        title: "Greška",
        description: "Neuspjelo spremanje vrsta pregleda",
        variant: "destructive",
      });
    }
    return ok;
  }, [toast]);

  const addType = useCallback(async (type: Omit<ExaminationType, "id"> & Partial<Pick<ExaminationType, "id">>) => {
    const nextId = Math.max(0, ...examTypes.map(t => t.id || 0)) + 1;
    const newType: ExaminationType = {
      id: type.id ?? nextId,
      name: type.name,
      duration: type.duration,
      price: type.price,
    } as ExaminationType;
    return saveTypes([...examTypes, newType]);
  }, [examTypes, saveTypes]);

  const updateType = useCallback(async (updated: ExaminationType) => {
    return saveTypes(examTypes.map(t => t.id === updated.id ? { ...t, ...updated } : t));
  }, [examTypes, saveTypes]);

  const deleteType = useCallback(async (id: number) => {
    return saveTypes(examTypes.filter(t => t.id !== id));
  }, [examTypes, saveTypes]);

  const options = useMemo(() => examTypes.map(t => ({ value: t.id.toString(), label: t.name, meta: t })), [examTypes]);

  return { examTypes, loading, refresh, saveTypes, addType, updateType, deleteType, options };
}

export default useExaminationTypes;
