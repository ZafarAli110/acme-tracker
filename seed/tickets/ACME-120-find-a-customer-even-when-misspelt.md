---
type: story
---

# ACME-120 Find a customer even when the name is misspelt

**Requested by** Sam (Service Advisor, Northside)

> People spell their names for me over the phone and I type what I hear. "Penwod" finds nobody, so I try again, and
> again, while the queue grows. I want the list to work out who I meant.

The customer search finds people whose name or company is spelt a little differently from what was typed, and says
when it is guessing.

## Acceptance criteria

- A search with a letter missing, an extra letter or two letters swapped in a name or company still finds the
  customer: "penwod", "penwoood" and "pnewood" all find Penwood.
- A correct spelling shows exactly the same list as today.
- When fewer than a page of customers match exactly, the closest spellings fill the rest of the page under "Did you
  mean", closest first.
- Email and phone are still found by any exact part of them. A phone number with one digit wrong does not find
  someone else.
- Close spellings come only from the person's own location, as all searches do.
- At Northside (1.6 million customers), a search answers within about a second.
- When nothing exact or close matches, the list says that no customers match.

## How we will check

- With the large sample data loaded, as `sam` at Northside: search "penwod". Customers named Penwood show under "Did
  you mean". Search "pnewood": Penwood is among the first results.
- As `sam`: search part of a customer's phone number. Exactly that customer shows. Change one digit: they do not.
- As `maria` at Riverside: misspell a surname only Northside has. No Northside customer appears.
- Each search answers within about a second.

## Not in this ticket

- Number plates (ACME-101, which finds a plate written in any spacing or case, but not a misspelt one).
- Suggestions while typing.

## Open points

- Searches of fewer than three letters stay exact: two letters are too few to compare spellings. If that is wrong,
  short searches would show near-random customers.
- An export of a searched list holds only the exact matches, not the "Did you mean" rows. If that is wrong, the file
  would differ from the screen.
