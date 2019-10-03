const electron = require('electron');
const axios = require('axios');
const { IconWallet } = require('icon-sdk-js');

const { ValidationError, TransactionError } = require('./utils/errors');

//{model: 'Stake|Favorite|Prep', ...}
const db = require('./db');

const TRACKER_ICON_API_URL = 'https://tracker.icon.foundation/v3/iiss/prep/list';
const QUERY_COUNT = 50;

function init() {
    electron.ipcMain.on('/preps', async (event) => {
        let page = 1;
        let data = await updatePreps(1, page);

        let count = 0;
        try {
            count = await db.countAsync({ model: 'Prep' });

            if (count == data.total) {
                console.log('Cache is actual')
                let preps = await db.findAsync({ model: 'Prep' });

                return event.sender.send('/preps', {
                    count: count,
                    total: data.total,
                    preps: preps.reduce((prev, next) => {
                        prev[next.address] = next.alias;
                        return prev;
                    }, {})
                });
            }
            console.log('Cache mismatch, re-collecting', count, data.total);
        }
        catch (err) {
            console.error(err);
            event.sender.send('/error', err);
        }

        try {
            //TODO: Review condition
            while (page * QUERY_COUNT < data.total + QUERY_COUNT - 1) {
                data = await updatePreps(QUERY_COUNT, page);
                event.sender.send('/preps', data);
                await savePreps(data, event);
                page++;
            }
        }
        catch (err) {
            console.error(err);
            event.sender.send('/error', err);
        }
    });
    electron.ipcMain.on('/keystore', async (event, keystore, password) => {
        try {
            let wallet = IconWallet.loadKeystore(keystore, password);
            event.sender.send('/keystore', wallet.getPrivateKey());
            require('./voteWorker')(wallet.getAddress(), wallet.getPrivateKey(), event.sender);
        }
        catch (err) {
            console.error(err);
            event.sender.send('/error', err);
        }
    });
    electron.ipcMain.on('/stake', async (event, stake) => {
        try {
            if (stake) {
                let { address, value } = stake;

                if (typeof (address) !== 'string') {
                    return event.sender.send('/error', new ValidationError('Address should be of type string'));
                }
                if (typeof (value) !== 'number' && value >= 0 && value <= 100) {
                    return event.sender.send('/error', new ValidationError('Value should be number 0-100(%)'));
                }
                if (value) {
                    await db.updateAsync({
                        model: 'Stake',
                        address: address
                    }, {
                        model: 'Stake',
                        address: address,
                        value: value
                    }, { upsert: true });
                    return event.sender.send('/stake', [{ address: address, value: value }]);
                }
                else {
                    await db.removeAsync({ model: 'Stake', address: address });
                    return event.sender.send('/stake', [{ address: address, value: 0 }]);
                }
            }
            else {
                let stakes = await db.findAsync({ model: 'Stake' });
                return event.sender.send('/stake', stakes.reduce((prev, next) => {
                    prev[next.address] = next.value;
                    return prev;
                }, {}));
            }
        }
        catch (err) {
            event.sender.send('/error', err);
        }
    });
    electron.ipcMain.on('/favorites', async (event, account) => {
        try {
            if (account) {
                let { address, alias, add } = account;

                if (add) {
                    await db.updateAsync({
                        model: 'Favorite',
                        address: address
                    }, {
                        model: 'Favorite',
                        address: address,
                        alias: alias
                    }, { upsert: true });
                }
                else {
                    await db.removeAsync({
                        model: 'Favorite',
                        address: address
                    });
                }
            }

            event.sender.send('/favorites', (await db.findAsync({
                model: 'Favorite'
            })).reduce((prev, next) => {
                prev[next.address] = next.alias;
                return prev;
            }, {}));
        }
        catch (err) {
            event.sender.send('/error', err);
        }
    });
}

async function savePreps(data) {
    await Promise.all(Object.keys(data.preps)
        .map(key => db.updateAsync({ model: 'Prep', address: key }, {
            model: 'Prep',
            address: key,
            alias: data.preps[key]
        }, { upsert: 1 }))
    );
}

async function updatePreps(count, page) {
    const resp = await axios.get(TRACKER_ICON_API_URL, {
        params: {
            count: count,
            page: page
        }
    });
    const data = resp.data;
    // console.log(`Preps: ${page * QUERY_COUNT}/${data.totalSize}`);

    let preps = {};
    data.data.forEach(prep => preps[prep.address] = prep.name || prep.address);

    return { total: data.totalSize, preps: preps };
}

module.exports = init;