const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("studyOsDesktop", {
  load: () => ipcRenderer.invoke("study-os:load"),
  save: (data) => ipcRenderer.invoke("study-os:save", data)
});
