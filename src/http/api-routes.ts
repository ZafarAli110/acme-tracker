import {z} from 'zod';
import {TICKET_STATUSES, TICKET_TYPES, type ProblemDto} from '../tickets/ticket-dto';
import {TrackerError, type TicketService} from '../tickets/ticket-service';

const ticketCreateRequest = z.object({
  type: z.enum(TICKET_TYPES),
  title: z.string(),
  description: z.string(),
});
const ticketUpdateRequest = z.object({status: z.enum(TICKET_STATUSES).optional()});
const commentCreateRequest = z.object({comment: z.string()});
const backlogOrderRequest = z.object({keys: z.array(z.string())});
const ticketMoveRequest = z.object({status: z.enum(TICKET_STATUSES), beforeKey: z.string().nullable()});

type KeyRequest = Request & {params: {key: string}};

/** The REST API the web app uses. Everything done here is recorded as done by a person. */
export function apiRoutes(ticketService: TicketService) {
  return {
    '/api/tickets': {
      GET: () => handle(() => Response.json(ticketService.list())),
      POST: (request: Request) =>
        handleAsync(async () => {
          const body = await parseAsync(request, ticketCreateRequest);
          return Response.json(ticketService.create(body, 'person'), {status: 201});
        }),
    },
    '/api/tickets/:key': {
      GET: (request: KeyRequest) => handle(() => Response.json(ticketService.get(request.params.key))),
      PATCH: (request: KeyRequest) =>
        handleAsync(async () => {
          const body = await parseAsync(request, ticketUpdateRequest);
          const ticket =
            body.status === undefined
              ? ticketService.get(request.params.key)
              : ticketService.changeStatus(request.params.key, body.status, 'person');
          return Response.json(ticket);
        }),
    },
    '/api/tickets/:key/move': {
      POST: (request: KeyRequest) =>
        handleAsync(async () => {
          const body = await parseAsync(request, ticketMoveRequest);
          return Response.json(ticketService.move(request.params.key, body.status, body.beforeKey, 'person'));
        }),
    },
    '/api/tickets/:key/comments': {
      POST: (request: KeyRequest) =>
        handleAsync(async () => {
          const body = await parseAsync(request, commentCreateRequest);
          return Response.json(ticketService.comment(request.params.key, body.comment, 'person'), {status: 201});
        }),
    },
    '/api/backlog': {
      PUT: (request: Request) =>
        handleAsync(async () => {
          const body = await parseAsync(request, backlogOrderRequest);
          return Response.json(ticketService.reorder(body.keys));
        }),
    },
  };
}

async function parseAsync<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  const result = schema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    throw new TrackerError(400, z.prettifyError(result.error));
  }
  return result.data;
}

function handle(work: () => Response): Response {
  try {
    return work();
  } catch (error) {
    return problem(error);
  }
}

async function handleAsync(work: () => Promise<Response>): Promise<Response> {
  try {
    return await work();
  } catch (error) {
    return problem(error);
  }
}

function problem(error: unknown): Response {
  if (error instanceof TrackerError) {
    const body: ProblemDto = {status: error.status, title: error.message, detail: null};
    return Response.json(body, {status: error.status});
  }
  console.error(error);
  const body: ProblemDto = {status: 500, title: 'Something went wrong in the tracker.', detail: String(error)};
  return Response.json(body, {status: 500});
}
