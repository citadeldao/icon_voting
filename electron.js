let mainWindow;

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const axios = require('axios');
const { IconWallet } = require('icon-sdk-js');

const IOSTABC_API_URL = 'https://www.iostabc.com/api/producers?sort_by=votes&order=desc';

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
electron.ipcMain.on('/producers', async (event) => {
    let page = 1;
    let data = await updateProducers(page);
    try {
        while (page * data.size < data.total) {
            console.log('producers', page * data.size, data.total);
            event.sender.send('/producers', data);
            data = await updateProducers(++page);
        }
    }
    catch (err) {
        console.error(err)
    }
});
electron.ipcMain.on('/keystore', async (event, keystore, password) => {
    //TODO:Implement on react side
    try {
        let wallet = IconWallet.loadKeystore(keystore, password);
        event.sender.send('/keystore', wallet.getPrivateKey());
    }
    catch (err) {
        event.sender.send('/error', err);
    }
});
electron.ipcMain.on('/stake', async (event, stake) => {
    //TODO:Implement
});
electron.ipcMain.on('/favorites', async (event, account) => {
    //TODO:Implement
});


async function updateProducers(page = 1) {
    const resp = await axios.get(IOSTABC_API_URL, {
        params: {
            page: page
        }
    })

    const data = resp.data;

    let producers = {};
    data.producers.forEach(producer => producers[producer.account] = producer.alias || producer.account);
    return { size: data.size, total: data.total, producers: producers };
}