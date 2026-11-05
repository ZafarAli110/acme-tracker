import {describe, expect, test} from 'bun:test';
import {openDatabase} from '../../database/open-database';
import {TicketRepository} from '../../tickets/ticket-repository';
import {TicketService} from '../../tickets/ticket-service';
import {handleMcpRequestAsync} from '../mcp-server';

const NOW = new Date('2026-11-03T09:00:00.000Z');

/** One JSON-RPC call to the MCP endpoint, as an agent makes it over Streamable HTTP. */
async function callAsync(service: TicketService, method: string, params: Record<string, unknown>) {
  const request = new Request('http://localhost/mcp', {
    method: 'POST',
    headers: {'content-type': 'application/json', accept: 'application/json, text/event-stream'},
    body: JSON.stringify({jsonrpc: '2.0', id: 1, method, params}),
  });
  const response = await handleMcpRequestAsync(request, service);
  return {status: response.status, body: (await response.json()) as {result?: Record<string, unknown>}};
}

function newService(): TicketService {
  return new TicketService(new TicketRepository(openDatabase(':memory:')), () => NOW);
}

describe('the MCP server', () => {
  test('answers the handshake as acme-tracker', async () => {
    const {status, body} = await callAsync(newService(), 'initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: {name: 'test', version: '1.0.0'},
    });

    expect(status).toBe(200);
    expect(body.result?.['serverInfo']).toMatchObject({name: 'acme-tracker'});
  });

  test("publishes each tool's input as JSON Schema, with the fields' descriptions", async () => {
    const {body} = await callAsync(newService(), 'tools/list', {});
    const tools = body.result?.['tools'] as {
      name: string;
      inputSchema: {properties: Record<string, {description?: string}>};
    }[];

    expect(tools.map((tool) => tool.name)).toEqual([
      'list_tickets',
      'get_ticket',
      'create_ticket',
      'update_ticket_status',
      'add_comment',
      'attach_file',
    ]);
    const createTicket = tools.find((tool) => tool.name === 'create_ticket');
    expect(createTicket?.inputSchema.properties['type']?.description).toBe('story or bug');
  });

  test('attaches a screenshot from a path, recorded as done by an agent', async () => {
    const service = newService();
    service.create({type: 'story', title: 'Recent customers', description: ''}, 'person');
    const path = `${process.env['TMPDIR'] ?? '/tmp'}/acme-tracker-test-${Date.now()}.png`;
    await Bun.write(path, new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));

    const {body} = await callAsync(service, 'tools/call', {
      name: 'attach_file',
      arguments: {key: 'ACME-101', path, caption: 'T1 PASS'},
    });

    expect(JSON.stringify(body.result)).toContain('Attached');
    expect(service.get('ACME-101').lastActivity).toMatchObject({actor: 'agent', kind: 'attached', comment: 'T1 PASS'});
    await Bun.file(path).delete();
  });

  test('creates a ticket through a tool call, recorded as done by an agent', async () => {
    const service = newService();

    const {body} = await callAsync(service, 'tools/call', {
      name: 'create_ticket',
      arguments: {
        type: 'bug',
        title: 'Prices show without the currency',
        description: 'Found while checking ACME-104.',
      },
    });

    expect(JSON.stringify(body.result)).toContain('Created ACME-');
    const [ticket] = service.list();
    expect(ticket?.title).toBe('Prices show without the currency');
  });

  test('refuses a tool call whose input does not fit the schema', async () => {
    const {body} = await callAsync(newService(), 'tools/call', {
      name: 'update_ticket_status',
      arguments: {key: 'ACME-1', status: 'nearly-done'},
    });

    expect(body.result?.['isError']).toBe(true);
  });
});
