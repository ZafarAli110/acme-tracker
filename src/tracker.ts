import {existsSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {openDatabase} from './database/open-database';
import {seedTickets} from './tickets/seed-tickets';
import {TicketRepository} from './tickets/ticket-repository';
import {TicketService} from './tickets/ticket-service';

const ROOT = join(import.meta.dir, '..');
export const DATABASE_PATH = join(ROOT, 'data', 'tracker.db');
export const SEED_DIRECTORY = join(ROOT, 'seed', 'tickets');

/**
 * Opens the tracker's database and adds any ticket in seed/tickets it does not have yet: all of them the first time,
 * and later only the new ones, so a tracker started before a ticket was written still gets it.
 */
export function openTracker(): TicketService {
  const ticketService = new TicketService(new TicketRepository(openDatabase(DATABASE_PATH)));
  const added = seedTickets(ticketService, SEED_DIRECTORY);
  if (added.length > 0) {
    console.log(`Added ${added.length} ticket(s) from seed/tickets: ${added.join(', ')}`);
  }
  return ticketService;
}

/** Deletes the database; the next start seeds it again. */
export function deleteTrackerData(): boolean {
  const existed = existsSync(DATABASE_PATH);
  for (const suffix of ['', '-wal', '-shm']) {
    rmSync(`${DATABASE_PATH}${suffix}`, {force: true});
  }
  return existed;
}
