---
type: story
---

# ACME-119 The customer list keeps up on a busy morning

**Requested by** Maria (Service Manager, Northside and Riverside)

> The list got quick for one person (ACME-110), but on a busy morning, with the whole desk on Customers, every screen
> spins and some show an error. The number at the top is the part I look at least: I need to know there are a lot,
> not whether it is 1,604,326.

The list gives the exact number of customers when people can use it, and says "10,000+" past that.

## Acceptance criteria

- When 10,000 or fewer customers match, the list shows the exact number, as today.
- When more match, the list shows "10,000+".
- Paging, sorting, filters and search show the same customers in the same order as before.
- On a busy morning at Northside, with the whole desk using Customers at once, the list still opens within about a
  second and nobody sees an error.

## How we will check

- With the large sample data loaded, as `sam` at Northside: open Customers. The total shows "10,000+". Search for a
  surname: the exact number of matches shows, the same as before.
- As `maria` at Riverside: filter by a city with fewer than 10,000 customers. The exact number shows.
- Run the busy-morning check (ACME-117) at Northside before and after: after, many more lists are answered each
  second, and none fail.

## Not in this ticket

- Finding a customer whose name is misspelt (ACME-120).
- Exports.
