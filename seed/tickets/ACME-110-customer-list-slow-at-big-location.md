---
type: story
---

# ACME-110 The customer list stays quick at our biggest location

**Requested by** Maria (Service Manager, Northside and Riverside)

> Northside's customer book passed a million names when we took over the two other dealers. At Riverside the list
> opens at once; at Northside I wait every time I open it, change the sort or go to the next page, and searching for a
> surname is the slowest of all. On a busy morning the whole front desk waits with me.

The list has to feel the same at Northside as at a small location, however many customers a location gains.

## Acceptance criteria

- At a location with more than a million customers, the Customers list opens, changes page, and sorts by name or by
  last contact within about a second.
- Filtering by status or city, and searching by surname, answer within about a second too.
- Adding or editing a customer is no slower than it is today.
- The list shows exactly the same customers, in the same order, as before: only faster.
- Putting the change live never stops the front desk: customers can still be opened, added and saved while it is
  applied, at Northside too.

## How we will check

- With the large sample data loaded, as `sam` at Northside: open Customers, go to the next page and to the last page,
  sort by name, then by last contact, filter by a city, and search for a surname. Each answers within about a second.
- The same steps at Riverside, before and after the change, show the same customers in the same order.
- Adding a customer at Northside takes no longer than before the change.
- While the change is being applied with the large sample data loaded, add and save a customer at Northside: it works
  and takes no longer than usual.
