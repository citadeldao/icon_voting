const electron = require('electron');
const axios = require('axios');
const { IconWallet } = require('icon-sdk-js');
//SQLite has issues with init, other DBMS-es are required to be installed separate or untested
const Datastore = require('nedb');
const Bluebird = require('bluebird');
const path = require('path');

const { ValidationError, TransactionError } = require('./utils/errors');

//{model: 'Stake|Favorite|Producer', ...}
const db = new Datastore({ filename: path.join(__dirname, '../store.db'), autoload: true });
Bluebird.promisifyAll(db);

const IOSTABC_API_URL = 'https://www.iostabc.com/api/producers?sort_by=votes&order=desc';


function init() {
    electron.ipcMain.on('/producers', async (event) => {
        let page = 1;
        let data = null;
        try {
            data = await updateProducers(page);
        }
        catch (err) {
            return event.sender.send('/error', err);
        }
        saveProducers(data, event);

        let count = 0;
        try {
            count = await db.countAsync({ model: 'Producer' });

            if (count == data.total) {
                console.log('Cache is actual')
                let producers = await db.findAsync({ model: 'Producer' });

                return event.sender.send('/producers', {
                    count: count,
                    total: data.total,
                    producers: producers.reduce((prev, next) => {
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
            while (page * data.size < data.total) {
                event.sender.send('/producers', data);
                data = await updateProducers(++page);
                await saveProducers(data, event);
            }
        }
        catch (err) {
            console.log(err);
            event.sender.send('/error', err);
        }
    });
    electron.ipcMain.on('/keystore', async (event, keystore, password) => {
        try {
            let wallet = IconWallet.loadKeystore(keystore, password);
            console.log(wallet.getPrivateKey());
            event.sender.send('/keystore', wallet.getPrivateKey());
        }
        catch (err) {
            event.sender.send('/error', err);
        }
    });
    electron.ipcMain.on('/stake', async (event, stake) => {
        if (stake) {
            let { address, value } = stake;
            if (typeof (address) !== 'string') {
                return event.sender.send('/error', new ValidationError('Address should be of type string'));
            }
            if (typeof (value) !== 'number' && value >= 0 && value <= 100) {
                return event.sender.send('/error', new ValidationError('Value should be number 0-100(%)'));
            }
            if (value) {
                return db.update({
                    model: 'Stake',
                    address: address,
                    value: value
                }, {
                    model: 'Stake',
                    address: address
                }, { upsert: true }, (err) => {
                    if (err) {
                        return event.sender.send('/error', err);
                    }
                    else {
                        return event.sender.send('/stake', [{ address: address, value: value }]);
                    }
                });
            }
            else {
                return db.remove({
                    model: 'Stake',
                    address: address
                });
            }
        }
        else {
            return db.find({ model: 'Stake' }, (err, stakes) => {
                if (err) {
                    return event.sender.send('/error', err);
                }
                else {
                    return event.sender.send('/stake', stakes);
                }
            })
        }

    });
    electron.ipcMain.on('/favorites', async (event, account) => {
        //TODO:Implement
        if (account) {
            await db.updateAsync({
                model: 'Favorite',
                address: account.address,
                alias: account.alias
            }, {
                model: 'Favorite',
                address: account.address
            }, { upsert: true });
        }

        event.sender.send('/favorites', (await db.findAsync({
            model: 'Favorite'
        })).reduce((prev, next) => {
            prev[next.address] = next.alias;
            return prev;
        }, {}));
    });
}

async function saveProducers(data) {
    await Promise.all(Object.keys(data.producers)
        .map(key => db.updateAsync({ model: 'Producer', address: key }, {
            model: 'Producer',
            address: key,
            alias: data.producers[key]
        }, { upsert: 1 }))
    );
}

async function updateProducers(page = 1) {
    const resp = await axios.get(IOSTABC_API_URL, {
        params: {
            page: page
        }
    })
    const data = resp.data;
    console.log({ page: page, size: data.size, total: data.total })
    console.log(`Producers: ${page * data.size}/${data.total}`);

    let producers = {};
    data.producers.forEach(producer => producers[producer.account] = producer.alias || producer.account);
    return { size: data.size, total: data.total, producers: producers };
}

module.exports = init;