const electron = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const AutoLaunch = require('auto-launch');

const { BrowserWindow, Tray, Menu } = electron;
let tray = null;

async function init() {
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
            app.exit();
            return;
        }
    }

    app.on("ready", () => {
        createWindow();
        tray = new Tray(path.join(__dirname, '../public/icon_128.png'));
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Hide/Expand',
                type: 'normal',
                click: () => {
                    if (mainWindow == null) {
                        createWindow();
                    }
                    else if (mainWindow.isVisible()) {
                        mainWindow.hide();
                    }
                    else {
                        mainWindow.show();
                    }
                }
            },
            {
                label: 'Exit',
                type: 'normal',
                click: () => app.exit()
            }
        ]);
        tray.setToolTip('Icon Power Vote');
        tray.setContextMenu(contextMenu);
        tray.on('double-click', () => {
            if (mainWindow == null) {
                createWindow();
            }
            else if (mainWindow.isVisible()) {
                mainWindow.hide();
            }
            else {
                mainWindow.show();
            }
        })
    });
    app.on("activate", () => {
        if (mainWindow === null) {
            createWindow();
        }
    });

    app.on('will-finish-launching', () => {
        electron.protocol.registerSchemesAsPrivileged([
            { scheme: 'file', privileges: { bypassCSP: true } }
        ])
    });

    try {
        let autoLauncher = new AutoLaunch({ name: 'Icon Power Vote' });
        if (!(await autoLauncher.isEnabled())) {
            await autoLauncher.enable();
        }
    }
    catch (err) {
        console.error(err);
    }

}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 360,
        height: 640,
        minWidth: 360,
        minHeight: 640,
        autoHideMenuBar: true,
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
    // mainWindow.on("closed", () => (mainWindow = null));
    mainWindow.on('close', e => {
        e.preventDefault();
        mainWindow.hide();
    });
}

module.exports = init;