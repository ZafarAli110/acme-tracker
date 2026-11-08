---
type: story
---

# ACME-122 When the system is busy, the desk sees it, the page tries again, and a save keeps its form

**Requested by** Sam (Service Advisor, Northside)

> On a busy morning I don't mind waiting a second, but I need to know what's going on. A spinner that never ends tells
> me nothing, and if I lose a form I typed while a customer waited, I have to start again in front of them.

When the system answers "busy" (ACME-121), every page says so, tries again by itself, and never loses what someone
typed.

## Acceptance criteria

- While a page's data is being tried again because the system is busy, a line at the bottom of the screen says "The
  system is busy, trying again…", on every page. It goes away when the data arrives.
- A page tries again by itself up to twice, about a second apart. If the system is still busy after that, the page
  says "The system is still busy. Try again in a moment."
- A save that is told "busy" is not sent again by itself. The form stays as it was typed, and says "The system is busy
  and nothing was saved. Your changes are still here: try again in a moment."
- Sending it again by hand saves it once: a new customer is never added twice.

## How we will check

- As `sam` at Northside, during the busy-morning check (ACME-117) at twice the rate the system handles: open
  Customers. The line "The system is busy, trying again…" shows, then the list; never a long spinner.
- During the same check, add a customer as `sam` until a save is told "busy": the form keeps every field and shows the
  message. Save again when the check stops: the customer is added once.
- With the system calm, nothing about the pages changes.

## Not in this ticket

- How the system decides it is busy, and saves first (ACME-121).
