const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectMusicFolder: () => ipcRenderer.invoke("select-music-folder"),
  getMetadata: (filePath) => ipcRenderer.invoke("get-metadata", filePath),
});
