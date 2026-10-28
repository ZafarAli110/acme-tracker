# Acme Tracker

The backlog for Acme DMS: a small, Jira-like tracker with a board, a backlog and a page per ticket. People use the web
page; agents use its MCP server, so they can read a ticket and move it along as they work. It runs on your machine and
needs no network.

## Run it

You need [Bun](https://bun.sh) 1.4.4 or later.

```bash
bun install
bun start
```

| What         | Where                     |
| ------------ | ------------------------- |
| Web page     | http://localhost:4100     |
| MCP endpoint | http://localhost:4100/mcp |

The first start creates the tickets from `seed/tickets/`. Set `TRACKER_PORT` to use another port.

## Connect an agent

Claude Code:

```bash
claude mcp add --transport http acme-tracker http://localhost:4100/mcp
```

The tools:

| Tool                   | What it does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `list_tickets`         | the backlog in priority order, optionally only one status            |
| `get_ticket`           | one ticket: description and acceptance criteria (markdown), activity |
| `update_ticket_status` | moves a ticket: `to-do`, `in-progress`, `in-review`, `done`          |
| `add_comment`          | adds a comment, e.g. what was done and how it was checked            |

Everything an agent does is recorded as done by an agent and marked in purple on the board, so the room can see it.

## Start again

```bash
bun run reset   # stop the tracker first; puts back the seed tickets, all in To Do, with no activity
```

## Tickets

A seed ticket is a markdown file: a `type:` (`story` or `bug`) in front matter, a `# KEY Title` heading, then the
description. Keys must follow on from each other (ACME-101, ACME-102, …). New tickets made in the web page get the next
key.

## Work on it

```bash
bun run dev     # restarts the server when src/ changes; the web page rebuilds on reload
bun run gate    # format, lint, typecheck, tests
```

| Path              | What                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `src/server.ts`   | the one process: web page, REST API (`/api`), MCP (`/mcp`)          |
| `src/tickets/`    | contracts, the rules (`TicketService`) and SQL (`TicketRepository`) |
| `src/http/`       | the REST API the web page uses                                      |
| `src/mcp/`        | the MCP tools                                                       |
| `web/`            | React + MUI web page, bundled by Bun                                |
| `data/tracker.db` | the SQLite database (not committed)                                 |
