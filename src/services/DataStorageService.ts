
import { 
  isFileSystemAvailable, 
  initializeFileSystem, 
  readJsonData, 
  writeJsonData, 
  logAction, 
  DATA_FILES, 
  DEFAULT_DIRS,
  createPatientDirectory
} from "@/utils/fileSystemUtils";
import { Patient } from "@/types/patient";
import { Appointment } from "@/types/medical-report";
import { User } from "@/types/user";
import { ExaminationType } from "@/types/medical-report";
import { v4 as uuidv4 } from "uuid";

interface ClinicSettings {
  name: string;
  address: string;
  city: string;
  canton: string;
  phone: string;
  email: string;
  logo?: string;
}

class DataStorageService {
  private _basePath: string = '';
  private _isInitialized: boolean = false;
  private _fallbackToLocalStorage: boolean = true;
  
  constructor() {
    this.loadBasePath();
  }
  
  /**
   * Get base path for data storage
   */
  get basePath(): string {
    return this._basePath;
  }
  
  /**
   * Set base path for data storage
   */
  set basePath(path: string) {
    this._basePath = path;
    localStorage.setItem('dataFolderPath', path);
  }
  
  /**
   * Check if data storage is initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }
  
  /**
   * Initialize data storage
   */
  async initialize(path?: string): Promise<boolean> {
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
  private loadBasePath(): void {
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
  async getPatients(): Promise<Patient[]> {
    if (this._fallbackToLocalStorage || !this.basePath) {
      const localData = localStorage.getItem('patients');
      return localData ? JSON.parse(localData) : [];
    }
    
    try {
      const patientsPath = `${this.basePath}${DATA_FILES.PATIENTS_INDEX}`;
      const data = await readJsonData<{ patients: Patient[] }>(patientsPath, { patients: [] });
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
  async savePatient(patient: Patient): Promise<boolean> {
    try {
      // Ensure patient has an ID
      if (!patient.id) {
        patient.id = uuidv4();
      }
      
      // Always update localStorage for compatibility
      const existingPatients = await this.getPatients();
      const existingIndex = existingPatients.findIndex(p => p.id === patient.id);
      
      let updatedPatients: Patient[];
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
      const folderName = existingIndex >= 0 ? 
        `${patient.name.replace(/\s+/g, '_')}_${patient.jmbg}` : 
        await createPatientDirectory(this.basePath, patient.name, patient.jmbg, patient);
        
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
   * Get appointments data
   */
  async getAppointments(): Promise<Appointment[]> {
    if (this._fallbackToLocalStorage || !this.basePath) {
      const localData = localStorage.getItem('appointments');
      return localData ? JSON.parse(localData) : [];
    }
    
    try {
      const appointmentsPath = `${this.basePath}${DATA_FILES.APPOINTMENTS}`;
      const data = await readJsonData<{ appointments: Appointment[] }>(appointmentsPath, { appointments: [] });
      return data.appointments || [];
    } catch (error) {
      console.error("[DataStorage] Error reading appointments:", error);
      
      // Fallback to localStorage
      const localData = localStorage.getItem('appointments');
      return localData ? JSON.parse(localData) : [];
    }
  }
  
  /**
   * Save appointments data
   */
  async saveAppointments(appointments: Appointment[]): Promise<boolean> {
    try {
      // Always update localStorage for compatibility
      localStorage.setItem('appointments', JSON.stringify(appointments));
      
      // If file system is not available, we're done
      if (this._fallbackToLocalStorage || !this.basePath) {
        return true;
      }
      
      // Save to file system
      const appointmentsPath = `${this.basePath}${DATA_FILES.APPOINTMENTS}`;
      await writeJsonData(appointmentsPath, { appointments, lastUpdated: new Date().toISOString() });
      
      // Log the action
      await logAction(this.basePath, `Updated appointments: ${appointments.length} appointments total`);
      
      return true;
    } catch (error) {
      console.error("[DataStorage] Error saving appointments:", error);
      return false;
    }
  }
  
  /**
   * Add a new appointment
   */
  async addAppointment(appointment: Appointment): Promise<boolean> {
    try {
      // Ensure appointment has an ID
      if (!appointment.id) {
        appointment.id = uuidv4();
      }
      
      const currentAppointments = await this.getAppointments();
      const updatedAppointments = [...currentAppointments, appointment];
      return await this.saveAppointments(updatedAppointments);
    } catch (error) {
      console.error("[DataStorage] Error adding appointment:", error);
      return false;
    }
  }
  
  /**
   * Get users data
   */
  async getUsers(): Promise<User[]> {
    if (this._fallbackToLocalStorage || !this.basePath) {
      const localData = localStorage.getItem('users');
      return localData ? JSON.parse(localData) : [];
    }
    
    try {
      const usersPath = `${this.basePath}${DATA_FILES.USERS}`;
      const data = await readJsonData<{ users: User[] }>(usersPath, { users: [] });
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
  async saveUsers(users: User[]): Promise<boolean> {
    try {
      // Always update localStorage for compatibility
      localStorage.setItem('users', JSON.stringify(users));
      
      // If file system is not available, we're done
      if (this._fallbackToLocalStorage || !this.basePath) {
        return true;
      }
      
      // Save to file system
      const usersPath = `${this.basePath}${DATA_FILES.USERS}`;
      await writeJsonData(usersPath, { users, lastUpdated: new Date().toISOString() });
      
      // Log the action
      await logAction(this.basePath, `Updated users: ${users.length} users total`);
      
      return true;
    } catch (error) {
      console.error("[DataStorage] Error saving users:", error);
      return false;
    }
  }
  
  /**
   * Get examination types
   */
  async getExaminationTypes(): Promise<ExaminationType[]> {
    if (this._fallbackToLocalStorage || !this.basePath) {
      const localData = localStorage.getItem('examinationTypes');
      return localData ? JSON.parse(localData) : [];
    }
    
    try {
      const typesPath = `${this.basePath}${DATA_FILES.EXAMINATION_TYPES}`;
      const data = await readJsonData<{ types: ExaminationType[] }>(typesPath, { types: [] });
      return data.types || [];
    } catch (error) {
      console.error("[DataStorage] Error reading examination types:", error);
      
      // Fallback to localStorage
      const localData = localStorage.getItem('examinationTypes');
      return localData ? JSON.parse(localData) : [];
    }
  }
  
  /**
   * Save examination types
   */
  async saveExaminationTypes(types: ExaminationType[]): Promise<boolean> {
    try {
      // Always update localStorage for compatibility
      localStorage.setItem('examinationTypes', JSON.stringify(types));
      
      // If file system is not available, we're done
      if (this._fallbackToLocalStorage || !this.basePath) {
        return true;
      }
      
      // Save to file system
      const typesPath = `${this.basePath}${DATA_FILES.EXAMINATION_TYPES}`;
      await writeJsonData(typesPath, { types, lastUpdated: new Date().toISOString() });
      
      // Log the action
      await logAction(this.basePath, `Updated examination types: ${types.length} types total`);
      
      return true;
    } catch (error) {
      console.error("[DataStorage] Error saving examination types:", error);
      return false;
    }
  }
  
  /**
   * Get clinic settings
   */
  async getClinicSettings(): Promise<ClinicSettings | null> {
    if (this._fallbackToLocalStorage || !this.basePath) {
      const localData = localStorage.getItem('clinicInfo');
      return localData ? JSON.parse(localData) : null;
    }
    
    try {
      const settingsPath = `${this.basePath}${DATA_FILES.SETTINGS}`;
      const data = await readJsonData<ClinicSettings | null>(settingsPath, null);
      return data;
    } catch (error) {
      console.error("[DataStorage] Error reading clinic settings:", error);
      
      // Fallback to localStorage
      const localData = localStorage.getItem('clinicInfo');
      return localData ? JSON.parse(localData) : null;
    }
  }
  
  /**
   * Save clinic settings
   */
  async saveClinicSettings(settings: ClinicSettings): Promise<boolean> {
    try {
      // Always update localStorage for compatibility
      localStorage.setItem('clinicInfo', JSON.stringify(settings));
      
      // If file system is not available, we're done
      if (this._fallbackToLocalStorage || !this.basePath) {
        return true;
      }
      
      // Save to file system
      const settingsPath = `${this.basePath}${DATA_FILES.SETTINGS}`;
      await writeJsonData(settingsPath, { ...settings, lastUpdated: new Date().toISOString() });
      
      // Save logo if exists
      if (settings.logo) {
        const logoPath = `${this.basePath}${DEFAULT_DIRS.SETTINGS}/logo.png`;
        
        // Convert base64 to binary and save
        const base64Data = settings.logo.replace(/^data:image\/png;base64,/, "");
        await window.electron.writeTextFile(logoPath, base64Data, "base64");
      }
      
      // Log the action
      await logAction(this.basePath, `Updated clinic settings`);
      
      return true;
    } catch (error) {
      console.error("[DataStorage] Error saving clinic settings:", error);
      return false;
    }
  }
  
  /**
   * Create a backup of all data
   */
  async createBackup(): Promise<string | null> {
    if (this._fallbackToLocalStorage || !this.basePath) {
      console.warn("[DataStorage] Cannot create backup - no file system access");
      return null;
    }
    
    try {
      const date = new Date().toISOString().split('T')[0];
      const backupFileName = `backup_${date}.zip`;
      const backupPath = `${this.basePath}${DEFAULT_DIRS.BACKUPS}/${backupFileName}`;
      
      await window.electron.createZipArchive(this.basePath, backupPath, [DEFAULT_DIRS.BACKUPS]);
      
      await logAction(this.basePath, `Created backup: ${backupFileName}`);
      return backupPath;
    } catch (error) {
      console.error("[DataStorage] Error creating backup:", error);
      return null;
    }
  }
}

// Export a singleton instance
const dataStorageService = new DataStorageService();

export { dataStorageService };
export default dataStorageService;
