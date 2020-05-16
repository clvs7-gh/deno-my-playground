import { Application, Router, Status, Context } from "https://deno.land/x/oak/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

const NET_LISTEN_HOST = '0.0.0.0';
const NET_LISTEN_PORT = 8080;

await log.setup({
  handlers: { console: new log.handlers.ConsoleHandler('DEBUG') },
  loggers: { default: { level: 'DEBUG', handlers: ['console'] } }
});
const logger = log.getLogger();

interface MyResponse {
  res: string;
  err?: string;
  elapsed?: number;
}

const app = new Application();
const router = new Router();

// Sample middleware
const waitRandomMs = () => async (ctx: Context, next: () => Promise<any>) => {
  const start = Date.now();
  await new Promise(r => setTimeout(r, Math.floor(Math.random() * 5000)));
  const ms = Date.now() - start;
  logger.debug(`Response time: ${ms}ms`);
  ctx.state.elapsed = ms;
  await next();
};

router
  .get('/', (ctx) => {
    ctx.response.status = Status.OK;
    ctx.response.body = { res: 'Hello, World!' };
  })
  .get<{ id: string | undefined }>('/d/:id?', waitRandomMs(), async (ctx) => {
    const id = ctx.params?.id;
    const res = `ID: ${id}`;
    const err = id ? void 0 : 'No ID';
    logger.debug(res);
    ctx.response.status = err ? Status.NotFound : Status.OK;
    ctx.response.body = { res, err, elapsed: ctx.state.elapsed };
  });

app.use(router.routes());
app.use(router.allowedMethods());

// NotFound middleware
app.use(async (ctx) => {
  ctx.response.status = Status.NotFound;
  ctx.response.body = { res: '', err: 'No route.' };
});

logger.info(`Server has been listening on ${NET_LISTEN_HOST}:${NET_LISTEN_PORT} ...`);

await app.listen({ hostname: NET_LISTEN_HOST, port: NET_LISTEN_PORT });
