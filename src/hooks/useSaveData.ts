
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

interface UseSaveDataConfig<T> {
  data: T;
  key: string;
  onSave?: (data: T) => Promise<void>;
  saveDelay?: number;
  condition?: boolean;
}

export function useSaveData<T>({
  data,
  key,
  onSave,
  saveDelay = 2000,
  condition = true,
}: UseSaveDataConfig<T>) {
  const { toast } = useToast();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [needsSave, setNeedsSave] = useState(false);
  const [saveAttempts, setSaveAttempts] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save on location change (navigation)
  useEffect(() => {
    const save = async () => {
      if (needsSave && condition) {
        await saveData();
        setNeedsSave(false);
      }
    };
    
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Save on data change after delay
  useEffect(() => {
    if (!condition) return;
    
    setNeedsSave(true);
    const timer = setTimeout(() => {
      if (needsSave) {
        saveData();
      }
    }, saveDelay);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, saveDelay]);

  // Save data implementation
  const saveData = async () => {
    if (isSaving || !condition) return;

    try {
      setIsSaving(true);
      
      // If we're offline or no onSave callback provided, save locally
      if (isOffline || !onSave) {
        saveLocally(key, data);
        setLastSaved(new Date());
        setNeedsSave(false);
        setSaveAttempts(0);
      } else {
        // Online saving with provided callback
        await onSave(data);
        setLastSaved(new Date());
        setNeedsSave(false);
        setSaveAttempts(0);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      const newAttempts = saveAttempts + 1;
      setSaveAttempts(newAttempts);
      
      // Show error toast only on first attempt or every 3 attempts
      if (newAttempts === 1 || newAttempts % 3 === 0) {
        toast({
          title: "Greška pri spremanju",
          description: "Nije moguće spremiti podatke. Pokušat ćemo ponovo automatski.",
          variant: "destructive",
        });
      }

      // Retry saving after increasing delay based on attempts
      setTimeout(() => {
        setNeedsSave(true);
      }, Math.min(saveDelay * newAttempts, 30000)); // Max 30 seconds between retries
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save function that can be called externally
  const forceSave = async () => {
    await saveData();
  };

  // Function to save data locally
  const saveLocally = (key: string, data: any) => {
    try {
      const savedPath = localStorage.getItem('dataFolderPath');
      
      // In a real desktop app, we would write to the file system here
      // For this web simulation, we'll use localStorage
      localStorage.setItem(`autosave_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        path: savedPath || "/default/path",
      }));
      
      // For demo purposes, log the save location
      console.log(`Data saved locally to ${savedPath || "/default/path"} for key ${key}`);
    } catch (error) {
      console.error("Error saving locally:", error);
      throw error;
    }
  };

  return {
    isSaving,
    lastSaved,
    isOffline,
    forceSave,
    saveStatus: isSaving ? "saving" : needsSave ? "pending" : "saved",
    retry: forceSave,
  };
}
