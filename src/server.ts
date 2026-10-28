import homepage from '../web/index.html';
import {apiRoutes} from './http/api-routes';
import {handleMcpRequestAsync} from './mcp/mcp-server';
import {openTracker} from './tracker';

const PORT = Number(process.env['TRACKER_PORT'] ?? 4100);

const ticketService = openTracker();

// One process: the web app (Bun bundles web/ on the fly), its REST API, and the MCP server agents connect to.
const server = Bun.serve({
  port: PORT,
  development: process.env['NODE_ENV'] !== 'production',
  routes: {
    '/': homepage,
    '/board': homepage,
    '/backlog': homepage,
    '/tickets/:key': homepage,
    ...apiRoutes(ticketService),
    '/mcp': (request) => handleMcpRequestAsync(request, ticketService),
  },
  fetch: () => Response.json({status: 404, title: 'Not found', detail: null}, {status: 404}),
});

console.log(`Acme tracker:  ${server.url}`);
console.log(`MCP endpoint:  ${new URL('/mcp', server.url)}`);
