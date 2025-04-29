
/**
 * Utility functions for file system operations in Electron environment
 */
const isElectron = typeof window !== 'undefined' && window.electron?.isElectron;

// Default directory structure
export const DEFAULT_DIRS = {
  ROOT: '',
  PATIENTS: '/Pacijenti',
  USERS: '/Korisnici',
  APPOINTMENTS: '/Termini',
  REPORTS: '/Nalazi',
  EXAMINATION_TYPES: '/VrstePregleda',
  SETTINGS: '/Postavke',
  BACKUPS: '/SigurnosneKopije',
};

// File paths for common data files
export const DATA_FILES = {
  PATIENTS_INDEX: '/Pacijenti/index.json',
  USERS: '/Korisnici/korisnici.json',
  APPOINTMENTS: '/Termini/svi-termini.json',
  REPORTS_INDEX: '/Nalazi/svi-nalazi.json',
  EXAMINATION_TYPES: '/VrstePregleda/vrste.json',
  SETTINGS: '/Postavke/postavke.json',
  LOG: '/log.txt',
};

/**
 * Checks if file system operations are available
 */
export function isFileSystemAvailable(): boolean {
  return isElectron;
}

/**
 * Create a directory if it doesn't exist
 * @param basePath - Base directory
 * @param relativePath - Relative path to create
 */
export async function createFolderIfNotExists(basePath: string, relativePath: string = ""): Promise<boolean> {
  if (!isFileSystemAvailable() || !basePath) return false;
  
  try {
    const fullPath = relativePath ? `${basePath}${relativePath}` : basePath;
    await window.electron.createDirectory(fullPath);
    return true;
  } catch (error) {
    console.error(`[FileSystem] Error creating directory ${relativePath}:`, error);
    return false;
  }
}

/**
 * Initialize the file system structure
 * @param basePath - Root directory for data
 */
export async function initializeFileSystem(basePath: string): Promise<boolean> {
  if (!isFileSystemAvailable() || !basePath) return false;

  try {
    console.log(`[FileSystem] Initializing file system at: ${basePath}`);
    
    // Create all required directories
    await createFolderIfNotExists(basePath);
    for (const dir of Object.values(DEFAULT_DIRS)) {
      if (dir) {
        await createFolderIfNotExists(basePath, dir);
      }
    }

    // Initialize empty data files if they don't exist
    const initialFiles = [
      { path: DATA_FILES.PATIENTS_INDEX, data: { patients: [] } },
      { path: DATA_FILES.USERS, data: { users: [] } },
      { path: DATA_FILES.APPOINTMENTS, data: { appointments: [] } },
      { path: DATA_FILES.REPORTS_INDEX, data: { reports: [] } },
      { path: DATA_FILES.EXAMINATION_TYPES, data: { types: [] } },
      { path: DATA_FILES.SETTINGS, data: { name: "", address: "", city: "", canton: "", phone: "", email: "" } },
    ];

    for (const file of initialFiles) {
      const exists = await window.electron.fileExists(`${basePath}${file.path}`);
      if (!exists) {
        await writeJsonData(`${basePath}${file.path}`, file.data);
      }
    }

    // Initialize log file if it doesn't exist
    const logExists = await window.electron.fileExists(`${basePath}${DATA_FILES.LOG}`);
    if (!logExists) {
      await window.electron.writeTextFile(
        `${basePath}${DATA_FILES.LOG}`,
        `EIBS System Log\nInitialized: ${new Date().toISOString()}\n`
      );
    } else {
      // Append initialization entry to existing log
      await logAction(basePath, "File system structure re-initialized");
    }

    return true;
  } catch (error) {
    console.error("[FileSystem] Error initializing file structure:", error);
    return false;
  }
}

/**
 * Create a patient directory and initialize required files
 * @param basePath - Root directory for data
 * @param patientName - Patient name
 * @param patientJmbg - Patient identification number
 * @param patientData - Initial patient data
 */
export async function createPatientDirectory(
  basePath: string,
  patientName: string,
  patientJmbg: string,
  patientData: any
): Promise<string> {
  if (!isFileSystemAvailable() || !basePath) {
    console.error("[FileSystem] File system not available or no base path");
    return "";
  }

  try {
    // Create safe directory name
    const dirName = `${patientName.replace(/\s+/g, '_')}_${patientJmbg}`;
    const patientDir = `${basePath}${DEFAULT_DIRS.PATIENTS}/${dirName}`;

    // Create patient directory and subdirectories
    await createFolderIfNotExists(patientDir);
    await createFolderIfNotExists(`${patientDir}/nalazi`);
    await createFolderIfNotExists(`${patientDir}/slike`);

    // Initialize patient files
    await writeJsonData(`${patientDir}/karton.json`, patientData);
    await writeJsonData(`${patientDir}/historija.json`, { visits: [] });
    await writeJsonData(`${patientDir}/nalazi/meta.json`, { reports: [] });

    // Log the action
    await logAction(basePath, `Created new patient directory: ${dirName}`);

    return dirName;
  } catch (error) {
    console.error("[FileSystem] Error creating patient directory:", error);
    return "";
  }
}

/**
 * Log an action to the system log
 * @param basePath - Root directory for data
 * @param message - Message to log
 */
export async function logAction(basePath: string, message: string): Promise<void> {
  if (!isFileSystemAvailable() || !basePath) return;

  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    // Append to log file
    await window.electron.appendToTextFile(`${basePath}${DATA_FILES.LOG}`, logEntry);
  } catch (error) {
    console.error("[FileSystem] Error logging action:", error);
  }
}

/**
 * Read data from a JSON file
 * @param filePath - Full path to the JSON file
 * @param defaultValue - Default value if file doesn't exist or can't be read
 */
export async function readJsonData<T>(filePath: string, defaultValue: T): Promise<T> {
  if (!isFileSystemAvailable()) return defaultValue;

  try {
    const exists = await window.electron.fileExists(filePath);
    if (!exists) return defaultValue;

    const data = await window.electron.readJsonFile(filePath);
    return data as T;
  } catch (error) {
    console.error(`[FileSystem] Error reading JSON file ${filePath}:`, error);
    return defaultValue;
  }
}

/**
 * Write data to a JSON file
 * @param filePath - Full path to the JSON file
 * @param data - Data to write
 */
export async function writeJsonData<T>(filePath: string, data: T): Promise<boolean> {
  if (!isFileSystemAvailable()) return false;

  try {
    await window.electron.writeJsonFile(filePath, data);
    return true;
  } catch (error) {
    console.error(`[FileSystem] Error writing JSON file ${filePath}:`, error);
    return false;
  }
}

/**
 * Read all patient directories
 * @param basePath - Root directory for data
 */
export async function readAllPatientDirectories(basePath: string): Promise<string[]> {
  if (!isFileSystemAvailable() || !basePath) return [];

  try {
    const patientsPath = `${basePath}${DEFAULT_DIRS.PATIENTS}`;
    const dirs = await window.electron.readDirectory(patientsPath);
    return dirs.filter(dir => !dir.startsWith('.'));
  } catch (error) {
    console.error("[FileSystem] Error reading patient directories:", error);
    return [];
  }
}

/**
 * Get patient data from patient directory
 * @param basePath - Root directory for data
 * @param patientDir - Patient directory name
 */
export async function getPatientData(basePath: string, patientDir: string): Promise<any> {
  if (!isFileSystemAvailable() || !basePath) return null;

  try {
    const patientPath = `${basePath}${DEFAULT_DIRS.PATIENTS}/${patientDir}`;
    return await readJsonData(`${patientPath}/karton.json`, null);
  } catch (error) {
    console.error("[FileSystem] Error reading patient data:", error);
    return null;
  }
}

/**
 * Move all data to a new location
 * @param oldPath - Current root directory
 * @param newPath - New root directory
 */
export async function migrateData(oldPath: string, newPath: string): Promise<boolean> {
  if (!isFileSystemAvailable() || !oldPath || !newPath) return false;

  try {
    // Initialize new location
    const initialized = await initializeFileSystem(newPath);
    if (!initialized) return false;

    // Copy all data from old location to new one
    await window.electron.copyDirectory(oldPath, newPath);
    
    await logAction(newPath, `Data migrated from ${oldPath} to ${newPath}`);
    return true;
  } catch (error) {
    console.error("[FileSystem] Error migrating data:", error);
    return false;
  }
}

/**
 * Create a backup of all data
 * @param basePath - Root directory for data
 */
export async function createBackup(basePath: string): Promise<string | null> {
  if (!isFileSystemAvailable() || !basePath) return null;

  try {
    const date = new Date().toISOString().split('T')[0];
    const backupFileName = `backup_${date}.zip`;
    const backupPath = `${basePath}${DEFAULT_DIRS.BACKUPS}/${backupFileName}`;
    
    await window.electron.createZipArchive(basePath, backupPath, [DEFAULT_DIRS.BACKUPS]);
    
    await logAction(basePath, `Created backup: ${backupFileName}`);
    return backupPath;
  } catch (error) {
    console.error("[FileSystem] Error creating backup:", error);
    return null;
  }
}

/**
 * Save a medical report to the file system
 * @param basePath - Root directory for data
 * @param patientId - Patient identifier
 * @param report - Report data to save
 */
export async function saveMedicalReport(basePath: string, patientId: string, report: any): Promise<boolean> {
  if (!isFileSystemAvailable() || !basePath) return false;
  
  try {
    // Find patient directory
    const allDirs = await readAllPatientDirectories(basePath);
    const patientDir = allDirs.find(dir => dir.includes(patientId));
    
    if (!patientDir) {
      console.error(`[FileSystem] Cannot find patient directory for ID: ${patientId}`);
      return false;
    }
    
    // Save report to patient's directory
    const reportPath = `${basePath}${DEFAULT_DIRS.PATIENTS}/${patientDir}/nalazi/${report.id}.json`;
    await writeJsonData(reportPath, report);
    
    // Update meta file
    const metaPath = `${basePath}${DEFAULT_DIRS.PATIENTS}/${patientDir}/nalazi/meta.json`;
    const meta = await readJsonData<{ reports: any[] }>(metaPath, { reports: [] });
    
    // Add or update report reference
    const existingIndex = meta.reports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      meta.reports[existingIndex] = {
        id: report.id,
        date: report.date,
        type: report.type,
        doctor: report.doctor
      };
    } else {
      meta.reports.push({
        id: report.id,
        date: report.date,
        type: report.type,
        doctor: report.doctor
      });
    }
    
    // Write updated meta file
    await writeJsonData(metaPath, meta);
    
    // Also update the global reports index
    const reportsIndexPath = `${basePath}${DATA_FILES.REPORTS_INDEX}`;
    const reportsIndex = await readJsonData<{ reports: any[] }>(reportsIndexPath, { reports: [] });
    
    // Add or update report in the global index
    const globalIndex = reportsIndex.reports.findIndex(r => r.id === report.id);
    if (globalIndex >= 0) {
      reportsIndex.reports[globalIndex] = {
        id: report.id,
        patientId,
        date: report.date,
        type: report.type,
        doctor: report.doctor
      };
    } else {
      reportsIndex.reports.push({
        id: report.id,
        patientId,
        date: report.date,
        type: report.type,
        doctor: report.doctor
      });
    }
    
    // Write updated global index
    await writeJsonData(reportsIndexPath, reportsIndex);
    
    await logAction(basePath, `Saved medical report: ${report.id} for patient: ${patientId}`);
    return true;
    
  } catch (error) {
    console.error("[FileSystem] Error saving medical report:", error);
    return false;
  }
}
