const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    show: false,
    icon: path.join(__dirname, 'assets/favicon.ico'),
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
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.on('closed', () => mainWindow = null);
  return mainWindow;
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on('redirect-to-tree', (event, url) => {
  if (!mainWindow) mainWindow = createWindow();
  const fullPath = path.join(__dirname, url.split('?')[0]);
  mainWindow.loadFile(fullPath).catch(err => {
    console.error('Load failed:', err);
    event.sender.send('redirect-error', 'Page not found');
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) app.quit();