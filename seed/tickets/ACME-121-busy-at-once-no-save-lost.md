---
type: story
---

# ACME-121 On a too-busy morning, the system answers at once, does the saves first, and recovers by itself

**Requested by** Maria (Service Manager, Northside and Riverside)

> When the system can't keep up, every screen just spins, for half a minute, and then fails anyway. I'd rather it told
> us straight away, and never lost a customer someone had just typed in. And once the rush passes, it should be back
> to normal by itself, without anyone restarting anything.

When there is more work than the system can do, it answers quickly anyway (with the answer, or with "busy"), does the
saves first, stops work nobody is waiting for, and recovers by itself. What the desk sees when it is told "busy" is
ACME-122.

## Acceptance criteria

- When the system is too busy to answer in time, it says so within about 2 seconds, instead of keeping the person
  waiting.
- Saving (a customer, stock, a part) goes before lists and searches. On a too-busy morning a list may be told "busy",
  but a save made in that time is not lost, and a save is never told "nothing was saved" when it was.
- Work for someone who has given up (closed the page, or the page stopped waiting) stops, so it does not slow down
  everyone else, and it never stops anyone else's work.
- With twice as much work as the system can do, every person gets an answer or "busy" within about 2 seconds.
- Within 10 seconds of the rush ending, everything answers as quickly as it did before the rush, with no restart.
- The system's own health check keeps answering during a rush, so it is never restarted for being busy.

## How we will check

- Measure the list at a calm rate, then run the busy-morning check (ACME-117) at twice the rate the system handles,
  with saves in it. Every answer, or "busy", arrives within about 2 seconds, and every save that was answered as saved
  is there afterwards.
- During the check, the system's health stays "healthy" on the dashboard.
- Stop the check. Within 10 seconds, the list answers as quickly as in the calm measurement.

## Not in this ticket

- What the desk sees when told "busy" (ACME-122).
- Making the system handle more work (ACME-119 and the queries that follow).
- Each location getting its own share of the system.
