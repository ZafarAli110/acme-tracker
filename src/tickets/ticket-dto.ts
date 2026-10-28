// The tracker's contracts, shared by the REST API, the MCP tools and the web app. Every field is always present; a
// missing value is `null`.

export const TICKET_STATUSES = ['to-do', 'in-progress', 'in-review', 'done'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  'to-do': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
};

export const TICKET_TYPES = ['story', 'bug'] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

/** Who did something: a person in the web app, or an agent through MCP. */
export type Actor = 'person' | 'agent';

export type ActivityKind = 'created' | 'status-changed' | 'commented';

export interface ActivityDto {
  id: number;
  actor: Actor;
  kind: ActivityKind;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  comment: string | null;
  at: string;
}

export interface TicketListItemDto {
  key: string;
  type: TicketType;
  title: string;
  status: TicketStatus;
  /** Position in the backlog, 1 first. */
  rank: number;
  updatedAt: string;
  lastActivity: ActivityDto;
}

export interface TicketDto extends TicketListItemDto {
  /** Markdown, as the product owner wrote it. */
  description: string;
  createdAt: string;
  /** Oldest first. */
  activity: ActivityDto[];
}

export interface TicketCreateRequestDto {
  type: TicketType;
  title: string;
  description: string;
}

/** PATCH: only the fields to change. */
export interface TicketUpdateRequestDto {
  status?: TicketStatus;
}

export interface CommentCreateRequestDto {
  comment: string;
}

/** A card dropped on the board: its new status, and the card it now sits above (null: the bottom of the column). */
export interface TicketMoveRequestDto {
  status: TicketStatus;
  beforeKey: string | null;
}

/** Every ticket key, in the new backlog order. */
export interface BacklogOrderRequestDto {
  keys: string[];
}

export interface ProblemDto {
  status: number;
  title: string;
  detail: string | null;
}
