import { Hono } from 'https://deno.land/x/hono@v3.7.2/mod.ts';
import { logger } from 'https://deno.land/x/hono@v3.7.2/middleware.ts';
import { cors } from 'https://deno.land/x/hono@v3.7.2/middleware.ts'
import { serveStatic } from 'https://deno.land/x/hono@v3.7.2/middleware.ts';


function createApp() {
  const app = new Hono();
  app.use("*", logger());
  app.use("*", cors({
    origin: ["http://localhost:8000", "https://chat.openai.com"],
  }));
  app.get('/', c => c.html("<h1>Hello World</h1>"));
  app.get('/todos', c => c.json({ 
    todos: [
      "Get milk",
      "Get eggs",
      "Make cookies",
    ],
  }));
  app.use('/*', serveStatic({ root: './static' }))
  return app;
}


// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const app = createApp();
  Deno.serve(app.fetch);
}
