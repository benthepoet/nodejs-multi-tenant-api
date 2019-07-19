const Koa = require('koa');
const Router = require('@koa/router');

const connections = require('./connections');

const app = new Koa();
const router = new Router();

router
  .get('/products', getProducts);

app
  .use(setConnection)
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(8082);

async function getProducts(ctx, next) {
  ctx.body = await ctx.connection('product').select();
}

async function setConnection(ctx, next) {
  const tenantId = ctx.request.headers['x-tenant-id'];

  if (!tenantId) {
    ctx.throw(400, 'Tenant ID was not specified.');
  }

  const connection = connections[tenantId];

  if (!connection) {
    ctx.throw(404, 'Tenant not found.');
  }

  ctx.connection = connection;

  await next();
}