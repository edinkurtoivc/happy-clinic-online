
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

interface UseSaveDataConfig<T> {
  data: T;
  key: string;
  onSave?: (data: T) => Promise<void>;
  saveDelay?: number;
  condition?: boolean;
  loadFromStorage?: boolean;
  onDataLoaded?: (data: T) => void;
}

export function useSaveData<T>({
  data,
  key,
  onSave,
  saveDelay = 2000,
  condition = true,
  loadFromStorage = true,
  onDataLoaded,
}: UseSaveDataConfig<T>) {
  const { toast } = useToast();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [needsSave, setNeedsSave] = useState(false);
  const [saveAttempts, setSaveAttempts] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

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

  // Load data from storage on initial render
  useEffect(() => {
    if (loadFromStorage && !initialDataLoaded) {
      try {
        const savedItem = localStorage.getItem(`autosave_${key}`);
        if (savedItem) {
          const savedData = JSON.parse(savedItem);
          console.log(`[AutoSave] Loaded data for key ${key}:`, savedData);
          
          if (savedData.data && onDataLoaded) {
            onDataLoaded(savedData.data);
            setLastSaved(new Date(savedData.timestamp));
            setInitialDataLoaded(true);
          }
        }
      } catch (error) {
        console.error(`[AutoSave] Error loading data for key ${key}:`, error);
      }
    }
  }, [key, loadFromStorage, initialDataLoaded, onDataLoaded]);

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
    
    console.log(`[AutoSave] Data changed for key ${key}, scheduling save...`);
    setNeedsSave(true);
    const timer = setTimeout(() => {
      if (needsSave) {
        console.log(`[AutoSave] Saving data for key ${key} after delay...`);
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
      console.log(`[AutoSave] Starting save for key ${key}`);
      
      // Save locally always to ensure data persistence
      saveLocally(key, data);
      
      // If we're online and onSave callback provided, also do cloud save
      if (!isOffline && onSave) {
        await onSave(data);
        console.log(`[AutoSave] Saved online for key ${key}`);
      }
      
      setLastSaved(new Date());
      setNeedsSave(false);
      setSaveAttempts(0);
      
    } catch (error) {
      console.error(`[AutoSave] Error saving data for key ${key}:`, error);
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
    console.log(`[AutoSave] Force saving data for key ${key}`);
    await saveData();
  };

  // Function to save data locally
  const saveLocally = (key: string, data: any) => {
    try {
      const savedPath = localStorage.getItem('dataFolderPath');
      
      localStorage.setItem(`autosave_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        path: savedPath || "/default/path",
      }));
      
      console.log(`[AutoSave] Data saved locally for key ${key}`);
    } catch (error) {
      console.error(`[AutoSave] Error saving locally for key ${key}:`, error);
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
    initialDataLoaded,
  };
}
