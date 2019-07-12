const Koa = require('koa');
const Router = require('@koa/router');
const knex = require('knex');

const config = require('./config.json');

const connections = setupConnections(config.tenants);

const app = new Koa();
const router = new Router();

router
  .get('/products', getProducts);

app
  .use(requireTenant)
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(8082);

async function getProducts(ctx, next) {
  ctx.body = await ctx.knex('product').select();
}

async function requireTenant(ctx, next) {
  const tenantId = ctx.request.headers['x-tenant-id'];

  if (!tenantId) {
    ctx.throw(400, 'Tenant ID was not specified.');
  }

  const connection = connections[tenantId];

  if (!connection) {
    ctx.throw(404, 'Tenant not found.');
  }

  ctx.knex = connection;

  await next();
}

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