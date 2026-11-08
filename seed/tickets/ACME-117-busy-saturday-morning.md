---
type: story
---

# ACME-117 The system holds a busy Saturday morning

**Requested by** Maria (Service Manager, Northside and Riverside)

> Since the merger every front desk, parts counter and service bay in the group works in Acme, and from spring the
> customer booking site will call it too. Saturday morning is our rush: everyone opens customers, checks parts and
> prices at once. Our IT partner says that is about 25 million requests a day, a million in a busy hour, and 200,000 in
> the busiest minute. If Acme slows down then, the whole group waits, and customers on the booking site leave.

Acme stays quick for everyone at the busiest minute of the week, and one person or one runaway script can never slow
everybody else down.

## Acceptance criteria

- With the large sample data, the system answers 200,000 requests in a minute (about 3,300 a second) of what people do
  on a Saturday morning: customer and parts lists, a part, recent customers, the stock value.
- Under that load, 95 of every 100 pages answer within about a third of a second, at Northside as at a small location.
- Fewer than 1 in 100 requests fail, and none shows another dealer's or another location's data.
- One person (or one script) asking for far more than a person would is told to slow down after a moment; everyone
  else carries on as before.
- When more is needed, adding servers adds capacity: nothing has to be rewritten, and nothing is lost when one stops.
- Saving still works exactly as before under load: two people saving the same customer still get the "someone else
  changed it" message, never a lost change.

## How we will check

- Load the large sample data and start the system with more than one server. Run the busy-morning check for a few
  minutes: it reports at least 3,300 requests a second, 95% within about a third of a second, and fewer than 1% failed.
- While it runs, open Customers at Northside in a browser: it feels as quick as on a quiet day.
- Have one person's browser (or a script) send requests as fast as it can: it is told to slow down; the busy-morning
  check's numbers barely move.
- Stop one server during the check: the others carry on, and the failures stay under 1%.
