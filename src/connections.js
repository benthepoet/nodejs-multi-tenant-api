const knex = require('knex');

const config = require('./config.json');

module.exports = setupConnections(config.tenants);

function setupConnections(tenants) {
  return Object
    .keys(tenants)
    .reduce(createConnection, {});

  function createConnection(accumulator, key) {
    accumulator[key] = knex({
      client: 'sqlite3',
      connection: {
          filename: `./db/${tenants[key]}.sqlite`
      }
    });

    return accumulator;
  }
}