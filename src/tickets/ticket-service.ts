import {moveTicket} from './move-ticket';
import {
  STATUS_LABELS,
  type ActivityDto,
  type Actor,
  type TicketCreateRequestDto,
  type TicketDto,
  type TicketListItemDto,
  type TicketStatus,
} from './ticket-dto';
import type {TicketRepository, TicketRow} from './ticket-repository';

export const KEY_PREFIX = 'ACME';

/** An expected failure, with the HTTP status it maps to. The MCP tools report its message to the agent. */
export class TrackerError extends Error {
  public readonly status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** The tracker's rules. The REST API and the MCP tools both go through here, so people and agents get the same. */
export class TicketService {
  private readonly _ticketRepository: TicketRepository;
  private readonly _now: () => Date;

  public constructor(ticketRepository: TicketRepository, now: () => Date = () => new Date()) {
    this._ticketRepository = ticketRepository;
    this._now = now;
  }

  public list(status: TicketStatus | null = null): TicketListItemDto[] {
    const lastActivities = this._ticketRepository.findLastActivities();
    return this._ticketRepository
      .findAll()
      .filter((ticket) => status === null || ticket.status === status)
      .map((ticket) => toListItem(ticket, lastActivities.get(ticket.key)));
  }

  public get(key: string): TicketDto {
    const ticket = this.getRow(key);
    const activity = this._ticketRepository.findActivity(ticket.key);
    return {
      ...toListItem(ticket, activity.at(-1)),
      description: ticket.description,
      createdAt: ticket.createdAt,
      activity,
    };
  }

  /** A new ticket goes to the bottom of the backlog, in To Do. */
  public create(request: TicketCreateRequestDto, actor: Actor): TicketDto {
    const title = request.title.trim();
    if (title === '') {
      throw new TrackerError(400, 'A ticket needs a title.');
    }
    const key = this._ticketRepository.inTransaction(() => {
      const number = this._ticketRepository.nextNumber();
      const at = this._now().toISOString();
      const ticket: TicketRow = {
        key: `${KEY_PREFIX}-${number}`,
        number,
        type: request.type,
        title,
        description: request.description.trim(),
        status: 'to-do',
        rank: this._ticketRepository.nextRank(),
        createdAt: at,
        updatedAt: at,
      };
      this._ticketRepository.insert(ticket);
      this._ticketRepository.insertActivity({
        ticketKey: ticket.key,
        actor,
        kind: 'created',
        fromStatus: null,
        toStatus: 'to-do',
        comment: null,
        at,
      });
      return ticket.key;
    });
    return this.get(key);
  }

  /** Moving a ticket to the status it already has changes nothing and records nothing. */
  public changeStatus(key: string, status: TicketStatus, actor: Actor): TicketDto {
    const ticket = this.getRow(key);
    this._ticketRepository.inTransaction(() => this.recordStatusChange(ticket, status, actor));
    return this.get(ticket.key);
  }

  /**
   * A card dropped on the board: into `status`, just before `beforeKey` (a ticket already in that status), or at the
   * end of that status's tickets when `beforeKey` is null. The status and the new order are saved together.
   */
  public move(key: string, status: TicketStatus, beforeKey: string | null, actor: Actor): TicketDto {
    const ticket = this.getRow(key);
    const before = beforeKey === null ? null : this.getRow(beforeKey);
    if (before !== null && before.key !== ticket.key && before.status !== status) {
      throw new TrackerError(400, `${before.key} is not in ${STATUS_LABELS[status]}.`);
    }
    const order = moveTicket(this._ticketRepository.findAll(), ticket.key, status, before?.key ?? null);
    this._ticketRepository.inTransaction(() => {
      this.recordStatusChange(ticket, status, actor);
      this._ticketRepository.reorder(order.map((row) => row.key));
    });
    return this.get(ticket.key);
  }

  public comment(key: string, comment: string, actor: Actor): TicketDto {
    const ticket = this.getRow(key);
    const text = comment.trim();
    if (text === '') {
      throw new TrackerError(400, 'A comment cannot be empty.');
    }
    const at = this._now().toISOString();
    this._ticketRepository.inTransaction(() => {
      this._ticketRepository.touch(ticket.key, at);
      this._ticketRepository.insertActivity({
        ticketKey: ticket.key,
        actor,
        kind: 'commented',
        fromStatus: null,
        toStatus: null,
        comment: text,
        at,
      });
    });
    return this.get(ticket.key);
  }

  /** `keys` must name every ticket exactly once, so a stale page cannot drop a ticket from the backlog. */
  public reorder(keys: string[]): TicketListItemDto[] {
    const current = this._ticketRepository.findAll().map((ticket) => ticket.key);
    const proposed = keys.map((key) => key.toUpperCase());
    const sameTickets =
      proposed.length === current.length &&
      new Set(proposed).size === proposed.length &&
      current.every((key) => proposed.includes(key));
    if (!sameTickets) {
      throw new TrackerError(409, 'The backlog has changed since it was loaded. Reload and try again.');
    }
    this._ticketRepository.reorder(proposed);
    return this.list();
  }

  /** Call inside a transaction. */
  private recordStatusChange(ticket: TicketRow, status: TicketStatus, actor: Actor): void {
    if (ticket.status === status) {
      return;
    }
    const at = this._now().toISOString();
    this._ticketRepository.updateStatus(ticket.key, status, at);
    this._ticketRepository.insertActivity({
      ticketKey: ticket.key,
      actor,
      kind: 'status-changed',
      fromStatus: ticket.status,
      toStatus: status,
      comment: null,
      at,
    });
  }

  private getRow(key: string): TicketRow {
    const ticket = this._ticketRepository.findByKey(key.trim());
    if (ticket === null) {
      throw new TrackerError(404, `There is no ticket ${key}.`);
    }
    return ticket;
  }
}

function toListItem(ticket: TicketRow, lastActivity: ActivityDto | undefined): TicketListItemDto {
  if (lastActivity === undefined) {
    // Every ticket is created with a 'created' activity, in the same transaction.
    throw new Error(`Ticket ${ticket.key} has no activity`);
  }
  return {
    key: ticket.key,
    type: ticket.type,
    title: ticket.title,
    status: ticket.status,
    rank: ticket.rank,
    updatedAt: ticket.updatedAt,
    lastActivity,
  };
}
