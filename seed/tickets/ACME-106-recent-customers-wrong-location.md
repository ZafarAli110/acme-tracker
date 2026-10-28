---
type: bug
---

# ACME-106 "Recently contacted" shows customers from another location

**Reported by** Maria (Service Manager, Riverside), via the service desk:

> On the home page, "Recently contacted" lists people I have never dealt with. When I click one of them I get "Customer
> was not found at this location". Sam at Northside says they are his customers.

Riverside staff must only ever see Riverside customers. Seeing another location's customers is a data protection
problem, not just an annoyance.

## Acceptance criteria

- "Recently contacted" shows only customers of the location selected in the top bar, newest contact first.
- Every customer in the list opens without an error.
- The same mistake cannot slip through again unnoticed.

## How we will check

- As `maria` at Riverside: every name in "Recently contacted" is also in the Customers list for Riverside.
- As `sam` at Northside: every name in "Recently contacted" is also in the Customers list for Northside, and none of
  them is on Maria's list.
