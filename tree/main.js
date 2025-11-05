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

  // Enforce Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-hashes' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: https://www.svgrepo.com https://via.placeholder.com; connect-src 'self' http://localhost:8080; font-src 'self' data: https://cdnjs.cloudflare.com;"
        ]
      }
    });
  });

  mainWindow.loadFile('index.html').then(() => {
    mainWindow.show();
    console.log('Loaded index.html successfully');
  }).catch(err => {
    console.error('Failed to load index.html:', err);
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

  // Redirect to tree/index.html after sign-up/sign-in
  ipcMain.on('redirect-to-tree', (event) => {
    if (mainWindow) {
      const treePath = path.join(__dirname, 'tree/index.html');
      mainWindow.loadFile(treePath).then(() => {
        console.log('Successfully redirected to tree/index.html');
      }).catch(err => {
        console.error('Failed to load tree/index.html:', err);
        event.sender.send('redirect-error', 'Failed to load the tree page. Please try again.');
      });
    } else {
      console.error('Main window is not available, creating new window');
      mainWindow = createWindow();
      const treePath = path.join(__dirname, 'tree/index.html');
      mainWindow.loadFile(treePath).then(() => {
        console.log('Fallback window loaded tree/index.html');
      }).catch(err => {
        console.error('Failed to load fallback window:', err);
        event.sender.send('redirect-error', 'Failed to load the tree page. Please try again.');
      });
    }
  });

  // Redirect back to index.html (login/main page)
  ipcMain.on('load-main-page', () => {
    if (mainWindow) {
      const indexPath = path.join(__dirname, 'index.html');
      mainWindow.loadFile(indexPath).then(() => {
        console.log('Successfully redirected to index.html');
      }).catch(err => {
        console.error('Failed to load index.html:', err);
      });
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) app.quit();