import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {TICKET_TYPES, type TicketCreateRequestDto, type TicketType} from './ticket-dto';
import type {TicketService} from './ticket-service';

export interface SeedTicket extends TicketCreateRequestDto {
  key: string;
}

/**
 * Reads a ticket written as markdown: a `type:` front matter, then `# ACME-101 Title`, then the description.
 * The file is what a product owner would paste into the tracker.
 */
export function parseSeedTicket(markdown: string, fileName: string): SeedTicket {
  const match = /^---\n([\s\S]*?)\n---\n+# (\S+) (.+)\n+([\s\S]*)$/.exec(markdown.replaceAll('\r\n', '\n'));
  if (!match) {
    throw new Error(`${fileName}: expected front matter, then "# KEY Title", then the description`);
  }
  const [, frontMatter = '', key = '', title = '', description = ''] = match;
  const type = /^type:\s*(\S+)\s*$/m.exec(frontMatter)?.[1];
  if (!TICKET_TYPES.includes(type as TicketType)) {
    throw new Error(`${fileName}: type must be one of ${TICKET_TYPES.join(', ')}`);
  }
  return {key, type: type as TicketType, title: title.trim(), description: description.trim()};
}

/**
 * Adds the seed tickets the tracker does not have yet, in key order, so each gets exactly the key its file names.
 * A new tracker gets them all. One started before a ticket was written gets just the new ones, and everything it
 * already has stays as it is: status, order, comments. A seed ticket whose key is already taken by a ticket made in the
 * tracker is skipped with a warning (`bun run reset` starts again from the seed). Returns the keys it added.
 */
export function seedTickets(ticketService: TicketService, directory: string): string[] {
  const seeds = readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .map((name) => parseSeedTicket(readFileSync(join(directory, name), 'utf8'), name))
    .toSorted((a, b) => a.key.localeCompare(b.key, 'en', {numeric: true}));
  const existing = new Map(ticketService.list().map((ticket) => [ticket.key, ticket.title]));
  const added: string[] = [];
  for (const seed of seeds) {
    const title = existing.get(seed.key);
    if (title !== undefined) {
      if (title !== seed.title) {
        console.warn(`Seed ticket ${seed.key} skipped: ${seed.key} is already "${title}". bun run reset starts again.`);
      }
      continue;
    }
    const created = ticketService.create({type: seed.type, title: seed.title, description: seed.description}, 'person');
    if (created.key !== seed.key) {
      throw new Error(
        `Seed ticket ${seed.key} was created as ${created.key}: a ticket made in the tracker took the key before it. ` +
          'Run bun run reset (with the tracker stopped) to start again from the seed.',
      );
    }
    existing.set(created.key, created.title);
    added.push(created.key);
  }
  return added;
}
