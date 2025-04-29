
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    getFolderInfo: (path) => ipcRenderer.invoke('getFolderInfo', path),
    isElectron: true,
    
    // File system operations
    createDirectory: async (dirPath) => {
      try {
        await ipcRenderer.invoke('fs:createDirectory', dirPath);
        return true;
      } catch (error) {
        console.error('Failed to create directory:', error);
        return false;
      }
    },
    
    fileExists: async (filePath) => {
      try {
        return await ipcRenderer.invoke('fs:fileExists', filePath);
      } catch (error) {
        console.error('Failed to check if file exists:', error);
        return false;
      }
    },
    
    readJsonFile: async (filePath) => {
      try {
        return await ipcRenderer.invoke('fs:readJsonFile', filePath);
      } catch (error) {
        console.error('Failed to read JSON file:', error);
        throw error;
      }
    },
    
    writeJsonFile: async (filePath, data) => {
      try {
        await ipcRenderer.invoke('fs:writeJsonFile', filePath, data);
        return true;
      } catch (error) {
        console.error('Failed to write JSON file:', error);
        return false;
      }
    },
    
    readTextFile: async (filePath) => {
      try {
        return await ipcRenderer.invoke('fs:readTextFile', filePath);
      } catch (error) {
        console.error('Failed to read text file:', error);
        throw error;
      }
    },
    
    writeTextFile: async (filePath, data) => {
      try {
        await ipcRenderer.invoke('fs:writeTextFile', filePath, data);
        return true;
      } catch (error) {
        console.error('Failed to write text file:', error);
        return false;
      }
    },
    
    appendToTextFile: async (filePath, data) => {
      try {
        await ipcRenderer.invoke('fs:appendToTextFile', filePath, data);
        return true;
      } catch (error) {
        console.error('Failed to append to text file:', error);
        return false;
      }
    },
    
    readDirectory: async (dirPath) => {
      try {
        return await ipcRenderer.invoke('fs:readDirectory', dirPath);
      } catch (error) {
        console.error('Failed to read directory:', error);
        return [];
      }
    },
    
    copyDirectory: async (src, dest) => {
      try {
        await ipcRenderer.invoke('fs:copyDirectory', src, dest);
        return true;
      } catch (error) {
        console.error('Failed to copy directory:', error);
        return false;
      }
    },
    
    createZipArchive: async (sourceDir, outputPath, excludeDirs = []) => {
      try {
        await ipcRenderer.invoke('fs:createZipArchive', sourceDir, outputPath, excludeDirs);
        return true;
      } catch (error) {
        console.error('Failed to create zip archive:', error);
        return false;
      }
    },
    
    deleteFile: async (filePath) => {
      try {
        await ipcRenderer.invoke('fs:deleteFile', filePath);
        return true;
      } catch (error) {
        console.error('Failed to delete file:', error);
        return false;
      }
    },
    
    deleteDirectory: async (dirPath) => {
      try {
        await ipcRenderer.invoke('fs:deleteDirectory', dirPath);
        return true;
      } catch (error) {
        console.error('Failed to delete directory:', error);
        return false;
      }
    }
  }
);
