---
type: story
---

# ACME-129 The busy morning on one ordinary database: cheap totals, pages and searches

**Requested by** Maria (Service Manager, Northside and Riverside)

> ACME-117 asked for 3,300 requests a second on a Saturday morning. Our IT partner says that, the way Acme asks the
> database today, it would need a database server several times bigger than anything we run. Much of that work is
> counting customers nobody reads one by one: I need to know if a search found 3 people or thousands, not whether
> Northside has 959,987 or 960,112 customers.

Every page asks the database for a small fraction of the work it asks for today, so the busy morning (ACME-117) fits
on one ordinary database server. Lists say roughly how many customers or parts there are instead of counting each
one, moving through a list costs the same on every page, a phone number is found by its start or end, and the
location's stock value may be a few seconds old.

## Acceptance criteria

- The whole customer list, or one filtered by status, shows "about" a number (for example "about 960,000 customers"),
  close to the real one.
- A search, or a filter on a name, city, phone or email, shows the exact number when every match fits on the first
  page, and otherwise "1–25 of many". It never shows a number that could be far off.
- The parts list shows its total the same way.
- The location's stock value is still exact to the cent, but may be up to 10 seconds old. A part's own stock shows a
  change at once.
- Recent customers open as quickly at Northside as at a small location.
- Previous, next, first and last page answer as quickly at the end of a long list as at its start.
- A person can jump straight to a page by its number, from the grid's page box or a link, up to the list's last
  reachable page (row 10,000, as today).
- A phone search matches numbers that start or end with what was typed, ignoring spaces, dashes and brackets
  ("0300 55", or the last four digits "4417"). Digits in the middle of a number no longer match. Names, companies and
  emails are searched as today.
- Every list still shows the same customers and parts, in the same order, as today; paging, sorting and filtering work
  as today.
- Nobody sees another dealer's or another location's data, and no count or total includes it.
- At the same rate of requests as today, the database does at most a fifth of the work it does today.

## How we will check

- With the large sample data loaded, as `sam` at Northside: open Customers. The total says "about" a number close to
  the real one. Filter by active: the same. Search for a surname with a handful of matches: the exact number. Search
  for part of a phone number with hundreds of matches: "1–25 of many", and the pages go on to the last match.
- As `maria` at Riverside: open Parts. Change a part's stock: the part shows it at once, and the location's stock
  value shows it within 10 seconds, to the cent.
- Open Recent customers at Northside: it answers as quickly as at Central.
- At Northside, go to the last page, then back with previous: each page answers as quickly as the first. Type page 300
  in the page box: that page opens.
- Search for the last four digits of a customer's phone, and for its first digits with a space: the customer is found.
- Run the busy-morning check (ACME-117) at the same rate before and after: the database's work per request is at most a
  fifth of what it was, and every page answers within the same third of a second or better.
- As `tom` at Northwind: no count or total includes Acme Motors' customers or parts.

## Not in this ticket

- Running the busy-morning check at the full 3,300 a second: one laptop cannot both send that and serve it; the check
  compares the work per request.
- Spreading reads over copies of the database, or splitting dealers across databases: for loads far beyond ACME-117.
