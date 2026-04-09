const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

let mainWindow;

// Register custom protocol scheme before app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true,
    supportFetchAPI: true,
    bypassCSP: true
  }
}]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Register file protocol handler for production
    const distPath = path.join(__dirname, '../dist');
    protocol.handle('app', (request) => {
      let reqPath = decodeURIComponent(new URL(request.url).pathname);
      // Remove leading slash on Windows
      if (reqPath.startsWith('/')) reqPath = reqPath.substring(1);
      const filePath = path.join(distPath, reqPath);
      return net.fetch(url.pathToFileURL(filePath).toString());
    });
    mainWindow.loadURL('app://./index.html');
  }
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers for file operations
ipcMain.handle('save-project', async (event, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'Star Story Project', extensions: ['ssp'] }],
    defaultPath: 'untitled.ssp'
  });
  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
  }
  return null;
});

ipcMain.handle('load-project', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Star Story Project', extensions: ['ssp'] }],
    properties: ['openFile']
  });
  if (filePaths && filePaths.length > 0) {
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    return { path: filePaths[0], data: JSON.parse(content) };
  }
  return null;
});

ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window-close', () => mainWindow.close());
