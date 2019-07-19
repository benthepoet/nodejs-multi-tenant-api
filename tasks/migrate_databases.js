const connections = require('../src/connections');

const promises = Object
  .keys(connections)
  .map(key => connections[key].migrate.latest());

Promise
  .all(promises)
  .then(() => process.exit());