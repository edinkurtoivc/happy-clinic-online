
import React, { useEffect, useState } from 'react';
import App from './App';
import { isElectron } from './utils/isElectron';
import { useToast } from './hooks/use-toast';
import dataStorageService from './services/DataStorageService';

const ElectronApp: React.FC = () => {
  const [isElectronEnv] = useState(isElectron());
  const { toast } = useToast();

  useEffect(() => {
    if (isElectronEnv) {
      console.log("Running in Electron environment");
      
      // Initialize data storage service
      const dataPath = localStorage.getItem('dataFolderPath');
      if (dataPath) {
        dataStorageService.initialize(dataPath);
        console.log("Data storage initialized with path:", dataPath);
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
  }, [isElectronEnv, toast]);

  return <App />;
};

export default ElectronApp;
