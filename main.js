const { app, BrowserWindow, ipcMain, Menu, nativeImage } = require('electron');
const path = require('path');

let win;

function createWindow() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));

  win = new BrowserWindow({
    width: 960,
    height: 660,
    minWidth: 700,
    minHeight: 520,
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

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [{ label: 'Exit', click: () => app.quit() }]
    },
    {
      label: 'About',
      submenu: [
        { label: 'Baccarat Recorder v1.0', enabled: false },
        { label: 'hammondcraig@yahoo.com', enabled: false }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
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
