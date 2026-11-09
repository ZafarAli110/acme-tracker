---
type: story
---

# ACME-124 The parts list keeps up with a full catalogue

**Requested by** Maria (Service Manager), for the parts counters at Northside and Riverside

> Now the whole catalogue is in, the parts page drags on a busy morning, more than the customer list does, and that
> has a million and a half people in it. Every page I turn, it seems to start again from scratch.

With a full catalogue loaded, the parts list, its total and the location's stock value come back as quickly as the
customer list, on a busy morning too.

## Acceptance criteria

- With a full catalogue (about 60,000 parts a dealer, tens of thousands stocked at each location), the parts list's
  first page, the next pages and a sort by any column answer about as fast as the customer list.
- The list shows the exact number of parts that match ("1–25 of 24,211"). It is worked out once for each search or
  filter, and turning pages or sorting does not work it out again.
- The stock value under the page title is always current: a saved change to stock or a price shows in it the next time
  the page loads. It answers about as fast as the list.
- A long part description ends with "…" where the column cuts it, and the full text shows on hover, at 1440 and 1024
  wide.
- Nothing else about the list changes: its search (ACME-123), sorting, filtering and paging work as today, and only the
  location's own parts show.

## How we will check

- With the large sample data loaded, as `maria` at Northside: open Parts. The first page shows with "of 24,211" (or
  that location's number). Turn to page 3 and sort by on hand: each answers at once.
- Change a part's price, save, and open Parts again: the stock value has moved by that part's quantity × the change.
- Look at a part with a long description: it ends with "…", and hovering shows all of it.
- During the busy-morning check (ACME-117), the parts list answers as fast as the customer list.

## Not in this ticket

- The parts search itself (ACME-123).
- Other locations' stock (ACME-104).

## Open points

- The total is exact, not "10,000+" as for customers: a location stocks tens of thousands of parts, not millions. If
  a location ever stocks far more, its total would cost more to work out.
