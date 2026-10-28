import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import {z} from 'zod';
import {STATUS_LABELS, TICKET_STATUSES, type ActivityDto, type TicketDto} from '../tickets/ticket-dto';
import {TrackerError, type TicketService} from '../tickets/ticket-service';

const STATUS_HELP = TICKET_STATUSES.map((status) => `${status} (${STATUS_LABELS[status]})`).join(', ');

/**
 * Handles one MCP request over Streamable HTTP. Stateless: every request gets its own server and transport, so there
 * are no sessions to lose when the tracker restarts. Everything an agent does is recorded as done by an agent.
 */
export async function handleMcpRequestAsync(request: Request, ticketService: TicketService): Promise<Response> {
  const server = createMcpServer(ticketService);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

function createMcpServer(ticketService: TicketService): McpServer {
  const server = new McpServer({name: 'acme-tracker', version: '0.1.0'});

  server.registerTool(
    'list_tickets',
    {
      title: 'List tickets',
      description: `Lists the backlog in priority order: key, type, status and title. Statuses: ${STATUS_HELP}.`,
      inputSchema: {status: z.enum(TICKET_STATUSES).optional().describe('Only tickets with this status')},
      annotations: {readOnlyHint: true},
    },
    ({status}) =>
      respond(
        () =>
          ticketService
            .list(status ?? null)
            .map((ticket) => `${ticket.key} [${ticket.type}] ${STATUS_LABELS[ticket.status]}: ${ticket.title}`)
            .join('\n') || 'No tickets.',
      ),
  );

  server.registerTool(
    'get_ticket',
    {
      title: 'Get a ticket',
      description:
        'Returns one ticket: its description and acceptance criteria as markdown, its status and its activity.',
      inputSchema: {key: z.string().describe('The ticket key, for example ACME-101')},
      annotations: {readOnlyHint: true},
    },
    ({key}) => respond(() => formatTicket(ticketService.get(key))),
  );

  server.registerTool(
    'update_ticket_status',
    {
      title: 'Move a ticket',
      description: `Moves a ticket to another status. Statuses: ${STATUS_HELP}.`,
      inputSchema: {
        key: z.string().describe('The ticket key, for example ACME-101'),
        status: z.enum(TICKET_STATUSES).describe('The new status'),
      },
      annotations: {readOnlyHint: false, idempotentHint: true},
    },
    ({key, status}) =>
      respond(() => {
        const ticket = ticketService.changeStatus(key, status, 'agent');
        return `${ticket.key} is now ${STATUS_LABELS[ticket.status]}.`;
      }),
  );

  server.registerTool(
    'add_comment',
    {
      title: 'Comment on a ticket',
      description: 'Adds a comment to a ticket, for example what was done and how it was checked. Markdown is allowed.',
      inputSchema: {
        key: z.string().describe('The ticket key, for example ACME-101'),
        comment: z.string().describe('The comment, in markdown'),
      },
      annotations: {readOnlyHint: false},
    },
    ({key, comment}) =>
      respond(() => {
        const ticket = ticketService.comment(key, comment, 'agent');
        return `Comment added to ${ticket.key}.`;
      }),
  );

  return server;
}

/** Expected failures (an unknown key, an empty comment) go back to the agent as a tool error it can act on. */
function respond(work: () => string) {
  try {
    return {content: [{type: 'text' as const, text: work()}]};
  } catch (error) {
    if (error instanceof TrackerError) {
      return {content: [{type: 'text' as const, text: error.message}], isError: true};
    }
    throw error;
  }
}

function formatTicket(ticket: TicketDto): string {
  return [
    `# ${ticket.key} ${ticket.title}`,
    '',
    `Type: ${ticket.type}`,
    `Status: ${STATUS_LABELS[ticket.status]} (${ticket.status})`,
    '',
    ticket.description,
    '',
    '## Activity',
    ...ticket.activity.map(formatActivity),
  ].join('\n');
}

function formatActivity(activity: ActivityDto): string {
  const who = activity.actor === 'agent' ? 'an agent' : 'a person';
  switch (activity.kind) {
    case 'created':
      return `- ${activity.at}: created by ${who}`;
    case 'status-changed':
      return `- ${activity.at}: ${who} moved it from ${label(activity.fromStatus)} to ${label(activity.toStatus)}`;
    case 'commented':
      return `- ${activity.at}: ${who} commented: ${activity.comment ?? ''}`;
  }
}

function label(status: ActivityDto['fromStatus']): string {
  return status === null ? '-' : STATUS_LABELS[status];
}
