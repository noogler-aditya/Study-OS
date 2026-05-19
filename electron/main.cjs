const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

const isDev = process.env.STUDY_OS_DEV === "true";
const dataFileName = "study-os-data.json";
const backupFileName = "study-os-data.backup.json";
const tempFileName = "study-os-data.tmp.json";

function dataDir() {
  return app.getPath("userData");
}

function dataFilePath() {
  return path.join(dataDir(), dataFileName);
}

function backupFilePath() {
  return path.join(dataDir(), backupFileName);
}

function tempFilePath() {
  return path.join(dataDir(), tempFileName);
}

/**
 * Read study data from the JSON file.
 * If the main file is corrupted, attempt recovery from backup.
 */
async function readStudyOsData() {
  await fs.mkdir(dataDir(), { recursive: true });

  // Try the main data file first
  try {
    const raw = await fs.readFile(dataFilePath(), "utf8");
    const data = JSON.parse(raw);
    // Basic shape validation
    if (data && typeof data === "object" && Array.isArray(data.subjects)) {
      return data;
    }
    throw new Error("Data file has invalid shape");
  } catch (error) {
    if (error && error.code === "ENOENT") return null;

    // Main file is corrupted — try the backup
    console.error("[Study OS] Main data file corrupted, trying backup:", error.message);
    try {
      const backupRaw = await fs.readFile(backupFilePath(), "utf8");
      const backupData = JSON.parse(backupRaw);
      if (backupData && typeof backupData === "object" && Array.isArray(backupData.subjects)) {
        // Restore backup as the main file
        await fs.writeFile(dataFilePath(), backupRaw, "utf8");
        console.log("[Study OS] Recovered from backup successfully.");
        return backupData;
      }
    } catch {
      // Backup also missing or corrupted
    }

    // Both files gone — return null to trigger seed data
    console.error("[Study OS] No recoverable data found. Starting fresh.");
    return null;
  }
}

/**
 * Atomic write: write to temp → backup existing → rename temp to main.
 * This ensures a crash at any point won't corrupt the data file.
 */
async function writeStudyOsData(data) {
  await fs.mkdir(dataDir(), { recursive: true });

  const jsonString = JSON.stringify(data, null, 2);
  const mainPath = dataFilePath();
  const tmpPath = tempFilePath();
  const bkpPath = backupFilePath();

  // Step 1: Write to temp file
  await fs.writeFile(tmpPath, jsonString, "utf8");

  // Step 2: Backup the current main file (if it exists)
  try {
    await fs.copyFile(mainPath, bkpPath);
  } catch {
    // No existing file to backup — that's fine (first save)
  }

  // Step 3: Atomic rename — temp becomes main
  await fs.rename(tmpPath, mainPath);
}

function createWindow() {
  nativeTheme.themeSource = "light";

  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1060,
    minHeight: 720,
    title: "Study OS",
    backgroundColor: "#f6f4ef",
    show: false,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  if (isDev) {
    window.loadURL("http://127.0.0.1:1420");
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

// IPC handlers — errors are properly propagated to the renderer
ipcMain.handle("study-os:load", async () => {
  try {
    return await readStudyOsData();
  } catch (error) {
    console.error("[Study OS] Load failed:", error);
    throw error;
  }
});

ipcMain.handle("study-os:save", async (_event, data) => {
  try {
    await writeStudyOsData(data);
    return { ok: true };
  } catch (error) {
    console.error("[Study OS] Save failed:", error);
    throw error;
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
