import type {Database} from 'bun:sqlite';
import type {ActivityDto, ActivityKind, Actor, TicketStatus, TicketType} from './ticket-dto';

export interface TicketRow {
  key: string;
  number: number;
  type: TicketType;
  title: string;
  description: string;
  status: TicketStatus;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewActivity {
  ticketKey: string;
  actor: Actor;
  kind: ActivityKind;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  comment: string | null;
  at: string;
}

const TICKET_COLUMNS =
  'key, number, type, title, description, status, rank, created_at AS createdAt, updated_at AS updatedAt';
const ACTIVITY_COLUMNS = 'id, actor, kind, from_status AS fromStatus, to_status AS toStatus, comment, at';

/** SQL for tickets and their activity. bun:sqlite is synchronous, so nothing here is async. */
export class TicketRepository {
  private readonly _database: Database;

  public constructor(database: Database) {
    this._database = database;
  }

  public findAll(): TicketRow[] {
    return this._database.query<TicketRow, []>(`SELECT ${TICKET_COLUMNS} FROM tickets ORDER BY rank`).all();
  }

  public findByKey(key: string): TicketRow | null {
    return (
      this._database
        .query<TicketRow, [string]>(`SELECT ${TICKET_COLUMNS} FROM tickets WHERE key = ?1 COLLATE NOCASE`)
        .get(key) ?? null
    );
  }

  public nextNumber(): number {
    const row = this._database
      .query<{next: number}, []>('SELECT COALESCE(MAX(number), 100) + 1 AS next FROM tickets')
      .get();
    return row?.next ?? 101;
  }

  public nextRank(): number {
    const row = this._database
      .query<{next: number}, []>('SELECT COALESCE(MAX(rank), 0) + 1 AS next FROM tickets')
      .get();
    return row?.next ?? 1;
  }

  public insert(ticket: TicketRow): void {
    this._database
      .query(
        `INSERT INTO tickets (key, number, type, title, description, status, rank, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
      )
      .run(
        ticket.key,
        ticket.number,
        ticket.type,
        ticket.title,
        ticket.description,
        ticket.status,
        ticket.rank,
        ticket.createdAt,
        ticket.updatedAt,
      );
  }

  public updateStatus(key: string, status: TicketStatus, updatedAt: string): void {
    this._database.query('UPDATE tickets SET status = ?2, updated_at = ?3 WHERE key = ?1').run(key, status, updatedAt);
  }

  public touch(key: string, updatedAt: string): void {
    this._database.query('UPDATE tickets SET updated_at = ?2 WHERE key = ?1').run(key, updatedAt);
  }

  /** Ranks follow the order of `keys`: the first key gets rank 1. */
  public reorder(keys: string[]): void {
    const update = this._database.query('UPDATE tickets SET rank = ?2 WHERE key = ?1');
    this._database.transaction(() => keys.forEach((key, index) => update.run(key, index + 1)))();
  }

  public insertActivity(activity: NewActivity): void {
    this._database
      .query(
        `INSERT INTO activity (ticket_key, actor, kind, from_status, to_status, comment, at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .run(
        activity.ticketKey,
        activity.actor,
        activity.kind,
        activity.fromStatus,
        activity.toStatus,
        activity.comment,
        activity.at,
      );
  }

  public findActivity(ticketKey: string): ActivityDto[] {
    return this._database
      .query<ActivityDto, [string]>(`SELECT ${ACTIVITY_COLUMNS} FROM activity WHERE ticket_key = ?1 ORDER BY id`)
      .all(ticketKey);
  }

  /** The newest activity of every ticket, by ticket key. */
  public findLastActivities(): Map<string, ActivityDto> {
    const rows = this._database
      .query<ActivityDto & {ticketKey: string}, []>(
        `SELECT ticket_key AS ticketKey, ${ACTIVITY_COLUMNS} FROM activity
         WHERE id IN (SELECT MAX(id) FROM activity GROUP BY ticket_key)`,
      )
      .all();
    return new Map(rows.map(({ticketKey, ...activity}) => [ticketKey, activity]));
  }

  /** Runs `work` in one transaction: everything it writes is saved, or nothing is. */
  public inTransaction<T>(work: () => T): T {
    return this._database.transaction(work)();
  }
}
