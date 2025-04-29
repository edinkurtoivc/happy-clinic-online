const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');
const { createReadStream, createWriteStream } = require('fs');

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the app
  const appURL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' // Dev server URL
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build path
  
  mainWindow.loadURL(appURL);

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for folder selection
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

// IPC handler to get folder size info
ipcMain.handle('getFolderInfo', async (event, folderPath) => {
  if (!folderPath) return { usedSpace: "0 MB", totalSpace: "Unknown", percentage: 0 };
  
  try {
    // This is a simplified version. In a real app, you would calculate actual disk usage
    const stats = await fs.stat(folderPath);
    return { 
      usedSpace: `${Math.round(stats.size / (1024 * 1024))} MB`, 
      totalSpace: "500 GB", 
      percentage: Math.min(stats.size / (500 * 1024 * 1024 * 1024) * 100, 100)
    };
  } catch (error) {
    console.error("Error getting folder info:", error);
    return { usedSpace: "0 MB", totalSpace: "Unknown", percentage: 0 };
  }
});

// File system operations
ipcMain.handle('fs:createDirectory', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:fileExists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('fs:readJsonFile', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to read JSON file ${filePath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:writeJsonFile', async (event, filePath, data) => {
  try {
    // Make sure the directory exists
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    
    // Write the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Failed to write JSON file ${filePath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:readTextFile', async (event, filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Failed to read text file ${filePath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:writeTextFile', async (event, filePath, data) => {
  try {
    // Make sure the directory exists
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    
    // Write the file
    await fs.writeFile(filePath, data);
    return true;
  } catch (error) {
    console.error(`Failed to write text file ${filePath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:appendToTextFile', async (event, filePath, data) => {
  try {
    await fs.appendFile(filePath, data);
    return true;
  } catch (error) {
    console.error(`Failed to append to text file ${filePath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:readDirectory', async (event, dirPath) => {
  try {
    return await fs.readdir(dirPath);
  } catch (error) {
    console.error(`Failed to read directory ${dirPath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:copyDirectory', async (event, src, dest) => {
  try {
    // Create a recursive function to copy directory contents
    async function copyDir(source, destination) {
      const entries = await fs.readdir(source, { withFileTypes: true });
      
      // Make sure destination directory exists
      await fs.mkdir(destination, { recursive: true });
      
      for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);
        
        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    }
    
    await copyDir(src, dest);
    return true;
  } catch (error) {
    console.error(`Failed to copy directory from ${src} to ${dest}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:createZipArchive', async (event, sourceDir, outputPath, excludeDirs = []) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure the output directory exists
      const outputDir = path.dirname(outputPath);
      fs.mkdir(outputDir, { recursive: true }).then(() => {
        const output = createWriteStream(outputPath);
        const archive = archiver('zip', {
          zlib: { level: 9 } // compression level
        });
        
        // Listen for events
        output.on('close', () => {
          resolve(true);
        });
        
        archive.on('error', (err) => {
          reject(err);
        });
        
        // Pipe archive data to the file
        archive.pipe(output);
        
        // Add files to the archive
        archive.directory(sourceDir, false, (entry) => {
          // Exclude specified directories
          if (excludeDirs.some(dir => entry.name.startsWith(dir.replace('/', '')))) {
            return false;
          }
          return entry;
        });
        
        // Finalize the archive
        archive.finalize();
      }).catch(err => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
});

ipcMain.handle('fs:deleteFile', async (event, filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
    throw error;
  }
});

ipcMain.handle('fs:deleteDirectory', async (event, dirPath) => {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`Failed to delete directory ${dirPath}:`, error);
    throw error;
  }
});
