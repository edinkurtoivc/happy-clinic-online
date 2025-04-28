const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

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
  const appURL = isDev 
    ? 'http://localhost:8080' // Dev server URL
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build path
  
  mainWindow.loadURL(appURL);

  // Open DevTools in development mode
  if (isDev) {
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
    // This is a simplified version. In a real app, you'd calculate actual disk usage
    return { 
      usedSpace: "245 MB", 
      totalSpace: "500 GB", 
      percentage: 0.5
    };
  } catch (error) {
    console.error("Error getting folder info:", error);
    return { usedSpace: "0 MB", totalSpace: "Unknown", percentage: 0 };
  }
});
