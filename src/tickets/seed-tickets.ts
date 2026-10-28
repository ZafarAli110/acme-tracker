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

/** Creates the seed tickets in key order, so they get exactly the keys their files name. Run on an empty tracker. */
export function seedTickets(ticketService: TicketService, directory: string): number {
  const tickets = readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .map((name) => parseSeedTicket(readFileSync(join(directory, name), 'utf8'), name))
    .toSorted((a, b) => a.key.localeCompare(b.key, 'en', {numeric: true}));
  for (const seed of tickets) {
    const created = ticketService.create({type: seed.type, title: seed.title, description: seed.description}, 'person');
    if (created.key !== seed.key) {
      throw new Error(
        `Seed ticket ${seed.key} was created as ${created.key}: is the tracker empty, and are the keys consecutive?`,
      );
    }
  }
  return tickets.length;
}
