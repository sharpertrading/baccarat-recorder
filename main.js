const { app, BrowserWindow, ipcMain, Menu, nativeImage } = require('electron');
const path = require('path');

let win;

function createWindow() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));

  win = new BrowserWindow({
    width: 480,
    height: 420,
    minWidth: 380,
    minHeight: 380,
    title: 'Baccarat Recorder',
    icon: icon,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  Menu.setApplicationMenu(null);
}

ipcMain.handle('toggle-always-on-top', () => {
  const current = win.isAlwaysOnTop();
  win.setAlwaysOnTop(!current);
  return !current;
});

ipcMain.handle('get-always-on-top', () => win.isAlwaysOnTop());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
