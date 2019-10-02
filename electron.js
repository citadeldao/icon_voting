const initApp = require('./electron-modules/init');
const initIpcRouter = require('./electron-modules/ipcRouter');

const mainWindow = initApp();
initIpcRouter();