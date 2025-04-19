const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null; // Track the main window globally

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    }
  });

  mainWindow.loadFile('index.html').then(() => {
    mainWindow.show();
  }).catch(err => {
    console.error('Failed to load window:', err);
  });

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('unresponsive', () => {
    console.warn('Window unresponsive, attempting reload...');
    mainWindow.reload();
  });

  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Handle redirect request from renderer
  ipcMain.on('redirect-to-tree', (event) => {
    if (mainWindow) {
      const treePath = path.join(__dirname, 'tree/index.html');
      console.log('Attempting to redirect to:', treePath); // Debug path
      mainWindow.loadFile(treePath).then(() => {
        console.log('Successfully redirected to tree/index.html');
      }).catch(err => {
        console.error('Failed to load tree/index.html:', err);
      });
    } else {
      console.error('Main window is not available, creating new window');
      mainWindow = createWindow();
      const treePath = path.join(__dirname, 'tree/index.html');
      mainWindow.loadFile(treePath).then(() => {
        console.log('Fallback window loaded tree/index.html');
      }).catch(err => {
        console.error('Failed to load fallback window:', err);
      });
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) app.quit();

module.exports = { app, createWindow };