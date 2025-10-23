const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
        minWidth: 1000,   // 🔹 ancho mínimo
    minHeight: 700,   // 🔹 alto mínimo
    maxWidth: 1600,   // 🔹 ancho máximo
    maxHeight: 900,   // 🔹 alto máximo
    resizable: true,  // ✅ permite redimensionar dentro de los límites
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  // Carga la app Angular compilada
  win.loadFile(path.join(__dirname, '../dist/angular-app/index.html'));
  win.setMenu(null);

  win.webContents.openDevTools(); // opcional
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
