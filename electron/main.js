const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { getMetadataFromFile } = require("./metadata");
const fs = require("fs");
const http = require("http");
let server; // ensure declared
let mainWindow;

async function startNextServer() {
  const next = require("next");
  const isProd = app.isPackaged;
  const dir = isProd
    ? path.join(process.resourcesPath, "next")
    : path.resolve(__dirname, "../next");
  const nextApp = next({ dev: !isProd, dir });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();
  const port = 3500;
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => handle(req, res));
    server.on("error", reject);
    server.listen(port, () => resolve(port));
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 1080,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // 
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (app.isPackaged) {
    const port = await startNextServer();
    await mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    await mainWindow.loadURL("http://localhost:3000");
  }
}

app.whenReady().then(createWindow);

ipcMain.handle("select-music-folder", async (event) => {
  const { dialog } = require("electron");
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled) return [];

  const folderPath = result.filePaths[0];
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".mp3") || file.endsWith(".wav"))
    .map((file) => path.join(folderPath, file));

  return files;
});

ipcMain.handle("get-metadata", async (event, filePath) => {
  return await getMetadataFromFile(filePath);
});

app.on("window-all-closed", () => {
  if (server) {
    server.close();
  }
  if (process.platform !== "darwin") app.quit();
});
