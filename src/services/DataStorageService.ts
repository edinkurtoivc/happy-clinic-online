import { isFileSystemAvailable, initializeFileSystem, readJsonData, writeJsonData, logAction, DATA_FILES, DEFAULT_DIRS, createPatientDirectory } from "@/utils/fileSystemUtils";
import { v4 as uuidv4 } from "uuid";

class DataStorageService {
  private _basePath = '';
  private _isInitialized = false;
  private _fallbackToLocalStorage = true;

  constructor() {
    this.loadBasePath();
  }

  /**
   * Get base path for data storage
   */
  get basePath() {
    return this._basePath;
  }

  /**
   * Set base path for data storage
   */
  set basePath(path) {
    this._basePath = path;
    localStorage.setItem('dataFolderPath', path);
  }

  /**
   * Check if data storage is initialized
   */
  get isInitialized() {
    return this._isInitialized;
  }

  /**
   * Initialize data storage
   */
  async initialize(path?: string) {
    if (path) {
      this.basePath = path;
    }

    if (!this.basePath) {
      console.warn("[DataStorage] No base path set, using localStorage fallback");
      this._fallbackToLocalStorage = true;
      return false;
    }

    if (isFileSystemAvailable()) {
      try {
        const initialized = await initializeFileSystem(this.basePath);
        this._isInitialized = initialized;
        this._fallbackToLocalStorage = !initialized;
        
        if (initialized) {
          await logAction(this.basePath, "Data storage initialized");
        }
        
        return initialized;
      } catch (error) {
        console.error("[DataStorage] Error initializing data storage:", error);
        this._fallbackToLocalStorage = true;
        return false;
      }
    } else {
      console.warn("[DataStorage] File system not available, using localStorage fallback");
      this._fallbackToLocalStorage = true;
      return false;
    }
  }

  /**
   * Load base path from localStorage
   */
  loadBasePath() {
    const path = localStorage.getItem('dataFolderPath') || '';
    this._basePath = path;
    
    // If path exists, try to initialize
    if (path) {
      this.initialize();
    }
  }

  /**
   * Get patients data
   */
  async getPatients() {
    if (this._fallbackToLocalStorage || !this.basePath) {
      const localData = localStorage.getItem('patients');
      return localData ? JSON.parse(localData) : [];
    }
    
    try {
      const patientsPath = `${this.basePath}${DATA_FILES.PATIENTS_INDEX}`;
      const data = await readJsonData(patientsPath, { patients: [] });
      return data.patients || [];
    } catch (error) {
      console.error("[DataStorage] Error reading patients:", error);
      // Fallback to localStorage
      const localData = localStorage.getItem('patients');
      return localData ? JSON.parse(localData) : [];
    }
  }

  /**
   * Save patient data
   */
  async savePatient(patient) {
    try {
      // Ensure patient has an ID
      if (!patient.id) {
        patient.id = uuidv4();
      }
      
      // Always update localStorage for compatibility
      const existingPatients = await this.getPatients();
      const existingIndex = existingPatients.findIndex(p => p.id === patient.id);
      
      let updatedPatients;
      if (existingIndex >= 0) {
        updatedPatients = existingPatients.map(p => p.id === patient.id ? patient : p);
      } else {
        updatedPatients = [...existingPatients, patient];
      }
      
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      
      // If file system is not available, we're done
      if (this._fallbackToLocalStorage || !this.basePath) {
        return true;
      }
      
      // Save to file system - first update the index
      const patientsIndexPath = `${this.basePath}${DATA_FILES.PATIENTS_INDEX}`;
      await writeJsonData(patientsIndexPath, {
        patients: updatedPatients,
        lastUpdated: new Date().toISOString()
      });
      
      // Create or update patient directory
      const folderName = existingIndex >= 0 
        ? `${patient.name.replace(/\s+/g, '_')}_${patient.jmbg}` 
        : await createPatientDirectory(this.basePath, patient);
      
      // If new patient was created, we're done as createPatientDirectory already writes the files
      if (existingIndex >= 0 && folderName) {
        const patientDir = `${this.basePath}${DEFAULT_DIRS.PATIENTS}/${folderName}`;
        await writeJsonData(`${patientDir}/karton.json`, patient);
      }
      
      // Log the action
      await logAction(this.basePath, `Updated patient: ${patient.name} (ID: ${patient.id})`);
      
      return true;
    } catch (error) {
      console.error("[DataStorage] Error saving patient:", error);
      return false;
    }
  }

  /**
   * Get users data
   */
  async getUsers() {
    if (this._fallbackToLocalStorage || !this.basePath) {
      const localData = localStorage.getItem('users');
      return localData ? JSON.parse(localData) : [];
    }
    
    try {
      const usersPath = `${this.basePath}${DATA_FILES.USERS}`;
      const data = await readJsonData(usersPath, { users: [] });
      return data.users || [];
    } catch (error) {
      console.error("[DataStorage] Error reading users:", error);
      // Fallback to localStorage
      const localData = localStorage.getItem('users');
      return localData ? JSON.parse(localData) : [];
    }
  }
  
  /**
   * Save users data
   */
  async saveUsers(users) {
    try {
      // Always update localStorage for compatibility
      localStorage.setItem('users', JSON.stringify(users));
      
      // If file system is not available, we're done
      if (this._fallbackToLocalStorage || !this.basePath) {
        return true;
      }
      
      // Save to file system
      const usersPath = `${this.basePath}${DATA_FILES.USERS}`;
      await writeJsonData(usersPath, {
        users: users,
        lastUpdated: new Date().toISOString()
      });
      
      // Log the action
      await logAction(this.basePath, `Updated users data`);
      
      return true;
    } catch (error) {
      console.error("[DataStorage] Error saving users:", error);
      return false;
    }
  }
}

// Export a singleton instance
const dataStorageService = new DataStorageService();

export { dataStorageService };
export default dataStorageService;
