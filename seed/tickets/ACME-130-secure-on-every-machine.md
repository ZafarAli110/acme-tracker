---
type: story
---

# ACME-130 The DMS on a developer's machine is secure as it is live: the same sign-in, the same connection

**Requested by** Ahmed (Tech Lead)

> On our laptops the DMS runs over a plain connection, so the sign-in works differently there from how it works live:
> the browser holds it under other rules. A sign-in problem could pass every check on a laptop and only show up after
> we go live. I want what we run every day to be what goes live, including the newer, faster browser connection if
> we can offer it.

On a developer's machine, the DMS opens over a secure connection, and the browser holds the sign-in under exactly the
rules it does live. Where the browser can use its newer connection, which sends many requests over one link, the DMS
offers it there as it would live.

## Acceptance criteria

- On a developer's machine, the DMS opens at a secure address, with no browser warning, after one setup step that works
  the same on Windows and on Mac and is written in the setup guide.
- The sign-in is held under the same rules on a developer's machine as live: only ever sent over a secure connection,
  only to the DMS itself, never readable by the page. Nothing about the sign-in differs between the two any more.
- Signing in, signing out (in one tab or two), a sign-in that has run out and switching location all work as they do
  today.
- Where the browser can use its newer connection, the DMS offers it on a developer's machine; the ticket records, with
  how it was checked, which connection the browser actually uses. If what the DMS runs on cannot offer it, the ticket
  says so, and everything else here is still delivered.
- The busy-morning measurement still measures what it did before, so new numbers compare with the old ones; when a
  secure connection changes what it costs, that is measured and written beside the old figure, not mixed into it.
- A developer who has not done the setup step is told what to do, not shown a broken page.
- Every page works as it does today, in English and French.

## How we will check

- On a fresh Windows machine and on a Mac, follow the setup guide: the DMS opens at a secure address with no warning.
- Sign in as `sam`: the browser shows the sign-in held only for secure connections to the DMS, and not readable by the
  page, the same as live.
- Sign out in one tab while another is open, let a sign-in run out, and switch location: each behaves as today.
- In the browser's own network view, see which connection the DMS's pages and requests use, and note it on the
  ticket.
- Run the busy-morning measurement at the same rate as the last recorded run: the numbers compare with it.
- Go through every page as `sam` and as `maria`, in English and French: everything works.

## Not in this ticket

- How the live system's own secure connection is set up (certificates, the load balancer): already in place.
- Making the DMS faster: this ticket is about being the same as live; any speed the newer connection brings is a bonus,
  measured, not a goal.
