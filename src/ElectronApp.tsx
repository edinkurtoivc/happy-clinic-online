
import React, { useEffect, useState } from 'react';
import App from './App';
import { isElectron } from './utils/isElectron';
import { useToast } from './hooks/use-toast';
import dataStorageService from './services/DataStorageService';

const ElectronApp: React.FC = () => {
  const [isElectronEnv] = useState(isElectron());
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsInitializing(true);
        
        // Always set bypassAuth to true to disable login screen
        localStorage.setItem("bypassAuth", JSON.stringify(true));
        
        if (isElectronEnv) {
          console.log("Running in Electron environment");
          
          // Initialize data storage service
          const dataPath = localStorage.getItem('dataFolderPath');
          if (dataPath) {
            await dataStorageService.initialize(dataPath);
            console.log("Data storage initialized with path:", dataPath);
            
            // Verify users are loaded
            const users = await dataStorageService.getUsers();
            console.log("Verified users:", users.length);
          } else {
            console.log("No data path found in localStorage");
            
            // Show toast to prompt user to set data path
            toast({
              title: "Podešavanje aplikacije",
              description: "Molimo postavite lokaciju za spremanje podataka u postavkama aplikacije.",
              duration: 10000,
            });
          }
        } else {
          console.log("Running in browser environment");
        }
      } catch (error) {
        console.error("Error initializing application:", error);
        toast({
          title: "Greška",
          description: "Došlo je do greške prilikom inicijalizacije aplikacije.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsInitializing(false);
      }
    };
    
    initApp();
  }, [isElectronEnv, toast]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Inicijalizacija aplikacije...</div>
      </div>
    );
  }

  return <App />;
};

export default ElectronApp;
