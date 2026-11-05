import * as v from 'valibot';
import {TICKET_STATUSES, TICKET_TYPES, type ProblemDto} from '../tickets/ticket-dto';
import {TrackerError, type TicketService} from '../tickets/ticket-service';

const ticketCreateRequest = v.object({
  type: v.picklist(TICKET_TYPES),
  title: v.string(),
  description: v.string(),
});
const ticketUpdateRequest = v.object({status: v.optional(v.picklist(TICKET_STATUSES))});
const commentCreateRequest = v.object({comment: v.string()});
const backlogOrderRequest = v.object({keys: v.array(v.string())});
const ticketMoveRequest = v.object({status: v.picklist(TICKET_STATUSES), beforeKey: v.nullable(v.string())});

type KeyRequest = Request & {params: {key: string}};
type AttachmentRequest = Request & {params: {key: string; id: string}};

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
    '/api/tickets/:key/attachments/:id': {
      GET: (request: AttachmentRequest) =>
        handle(() => {
          const file = ticketService.attachment(request.params.key, Number(request.params.id));
          return new Response(new Blob([new Uint8Array(file.bytes)]), {
            headers: {'Content-Type': file.contentType, 'Cache-Control': 'no-store'},
          });
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

/** The request body checked against its schema; a body that does not fit is a 400 that says what is wrong. */
async function parseAsync<TSchema extends v.GenericSchema>(
  request: Request,
  schema: TSchema,
): Promise<v.InferOutput<TSchema>> {
  const result = v.safeParse(schema, await request.json().catch(() => null));
  if (!result.success) {
    throw new TrackerError(400, v.summarize(result.issues));
  }
  return result.output;
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
