---
type: story
---

# ACME-105 Customers due a service call-back

**Requested by** Maria (Service Manager, Riverside)

> Thursdays and Fridays the workshop has empty bays while customers who have not been in for a year are driving
> around on worn tyres. When it is quiet, the advisors should be ringing those people. Today nobody knows who they are.

## What we want

A list of our customers the desk has not spoken to for a while, so advisors can ring them when the workshop is quiet.

## Acceptance criteria

- A "Due a call-back" list shows the **active** customers of the selected location whom we have not been in contact
  with for six months or more.
- Active customers we have never been in contact with are on the list too, at the top.
- Then the list is sorted by last contact, longest ago first.
- Each entry shows the name, company, phone number and last contact date. A customer without a phone number shows
  their email instead, so the advisor knows to write rather than ring.
- Prospects and inactive customers are not on the list.
- Once a contact with the customer is recorded, they drop off the list.

## How we will check

- As `sam` at Northside: Jonas Berg (last contact November 2025) and Finn Gallagher (March 2026) are on the list,
  Jonas first. Hiro Tanaka (inactive) and Elena Rossi (prospect) are not.
- As `maria` at Riverside: Noah Fischer is on the list, and no Northside customer is.
- As `sam`: change Finn's last contact to today; he drops off the list.

## Not in this ticket

- Sending reminders automatically.
- Logging the call itself (ACME-103).
