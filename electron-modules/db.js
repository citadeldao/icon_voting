const Datastore = require('nedb');
const Bluebird = require('bluebird');
const path = require('path');

//SQLite has issues with init, other DBMS-es are required to be installed separate or untested
const db = new Datastore({ filename: path.join(__dirname, '../store.db'), autoload: true });
Bluebird.promisifyAll(db);

module.exports = db;