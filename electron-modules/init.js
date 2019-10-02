const electron = require('electron');
const isDev = require('electron-is-dev');

const BrowserWindow = electron.BrowserWindow;

function init() {
    const app = electron.app;

    if (app.makeSingleInstance) {
        var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            }
        });

        if (shouldQuit) {
            app.quit();
            return;
        }
    }

    app.on("ready", createWindow);
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
    app.on("activate", () => {
        if (mainWindow === null) {
            createWindow();
        }
    });

}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 360,
        height: 640,
        webPreferences: {
            nodeIntegration: true,
            preload: __dirname + '/preload.js'
        }
    });

    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => (mainWindow = null));
}

module.exports = init;