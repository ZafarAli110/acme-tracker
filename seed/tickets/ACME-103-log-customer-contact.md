---
type: story
---

# ACME-103 Log a call or visit with a customer

**Requested by** Sam (Service Advisor, Northside)

> Ben Whitaker rang on Tuesday to say his van could not come in until Friday. I agreed a courtesy car. On Friday I was
> off, my colleague had no idea, and Ben got no car. Whatever we agree with a customer lives in someone's head or on
> a sticky note.

## What we want

Every call, visit or email with a customer is written down on the customer, so whoever picks up next knows what was
said.

## Acceptance criteria

- On a customer, the advisor can log a contact: the kind (phone, visit or email), the date and a note of what was said
  or agreed. The note is required.
- The date defaults to today. It can be earlier, for a call someone forgot to log, but never in the future.
- The customer's page shows the contact history, newest first, with who logged each entry. Entries cannot be edited or
  deleted afterwards.
- Logging a contact updates the customer's "last contact" date, so "Recently contacted" on the home page shows them.
  A contact logged late for an earlier date never moves the "last contact" date backwards.

## How we will check

- As `sam` at Northside: log a phone call with Ben Whitaker today. It is at the top of his history, shows Sam as the
  author, and Ben is first in "Recently contacted".
- As `sam`: log a visit for Ben dated last month. It appears below today's call, and Ben's last contact stays today.
- As `sam`: try to log a call for tomorrow; it is refused.
- As `maria` at Riverside: Ben's history is not visible to her.

## Not in this ticket

- Sending emails or texts from the app.
- Reminders to call back (ACME-105).
