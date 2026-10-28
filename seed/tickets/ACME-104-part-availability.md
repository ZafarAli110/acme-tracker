---
type: story
---

# ACME-104 Is the part in stock? (customer on the phone)

**Requested by** Sam (Service Advisor, Northside)

> A customer rings: "Can you do my front brake pads on Thursday?" To answer, I have to walk to the parts counter, wait
> for them to check, and then call Riverside if we have none. Half the time the customer has hung up and rung another
> garage.

## What we want

While the customer is on the phone, the advisor can see whether we have a part, here or at our other locations, and
book the job with confidence.

## Acceptance criteria

- The advisor searches by part number or by words in the description (`brake pad`, `oil filter`).
- For each matching part they see the price, how many we have **here** and in which bin, and how many each of our
  other locations has.
- A part we have here below its reorder level is shown as low, because it may be gone by Thursday.
- A part the dealer carries but this location does not stock shows as "not stocked here", with the other locations'
  quantities, and never as an error.
- Checking availability never changes stock. In particular it never adds a part to this location's stock.
- A part nobody in the group carries shows "We don't carry this part".

## How we will check

- As `maria` at Riverside: search `brake`. Every match shows Riverside's quantity and bin, plus Northside's quantity.
- As `maria`: search for a part only Northside stocks. It shows "not stocked here" and Northside's quantity, and after
  the search Riverside's parts list is unchanged.
- As `sam` at Northside: a part below its reorder level here is shown as low.

## Not in this ticket

- Reserving the part or asking for a transfer.
- Booking the job.
