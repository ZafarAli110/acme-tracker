import type {
  ProblemDto,
  TicketCreateRequestDto,
  TicketDto,
  TicketListItemDto,
  TicketStatus,
} from '../../src/tickets/ticket-dto';

export class ApiError extends Error {
  public readonly problem: ProblemDto;

  public constructor(problem: ProblemDto) {
    super(problem.title);
    this.problem = problem;
  }
}

async function sendAsync<T>(method: string, path: string, body: unknown = null): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body === null ? {} : {'content-type': 'application/json'},
    body: body === null ? null : JSON.stringify(body),
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ProblemDto | null;
    throw new ApiError(problem ?? {status: response.status, title: response.statusText, detail: null});
  }
  return (await response.json()) as T;
}

export const trackerApi = {
  getTicketsAsync: () => sendAsync<TicketListItemDto[]>('GET', '/api/tickets'),
  getTicketAsync: (key: string) => sendAsync<TicketDto>('GET', `/api/tickets/${encodeURIComponent(key)}`),
  createTicketAsync: (request: TicketCreateRequestDto) => sendAsync<TicketDto>('POST', '/api/tickets', request),
  changeStatusAsync: (key: string, status: TicketStatus) =>
    sendAsync<TicketDto>('PATCH', `/api/tickets/${encodeURIComponent(key)}`, {status}),
  moveTicketAsync: (key: string, status: TicketStatus, beforeKey: string | null) =>
    sendAsync<TicketDto>('POST', `/api/tickets/${encodeURIComponent(key)}/move`, {status, beforeKey}),
  addCommentAsync: (key: string, comment: string) =>
    sendAsync<TicketDto>('POST', `/api/tickets/${encodeURIComponent(key)}/comments`, {comment}),
  reorderAsync: (keys: string[]) => sendAsync<TicketListItemDto[]>('PUT', '/api/backlog', {keys}),
};
