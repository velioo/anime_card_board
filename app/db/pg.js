const CONSTANTS = require('../constants/constants');

const {
	PGUSER,
	PGDATABASE,
	CONNECTION_LIMIT,
	IDLE_TIMEOUT_MILLIS,
} = require('../constants/constants');



var pg = require('pg');
var config = {
	connectionString: process.env.DATABASE_URL,
	ssl: {
    rejectUnauthorized: false
  },
  // user: PGUSER, // name of the user account
  // database: PGDATABASE, // name of the database
  max: CONNECTION_LIMIT, // max number of clients in the pool
  idleTimeoutMillis: IDLE_TIMEOUT_MILLIS,
}

if (!config.connectionString) {
	config.user = PGUSER;
	config.database = PGDATABASE;
	delete config.ssl;
}

var pool = new pg.Pool(config);

module.exports = {
  pool: pool
};