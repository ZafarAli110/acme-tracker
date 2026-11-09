---
type: story
---

# ACME-125 When a save gets no answer, saving again is always safe: nothing is added twice

**Requested by** Sam (Service Advisor, Northside)

> Sometimes I press Save and the page just says the server took too long. Did it save or not? If I press Save again I
> might add the customer twice, and if I don't I might lose them. Either way I end up searching for the customer while
> they stand at the desk.

When a save gets no answer in time, or the connection drops after Save is pressed, the form says it could not confirm
the save, and pressing Save again is always safe: the save happens once, whether or not the first one went through.
This covers every save: adding or changing a customer, a part or a bin, setting stock, and adding a photo.

## Acceptance criteria

- When a save gets no answer in time, or the connection drops, the form keeps every field and says "We could not
  confirm the save. Save again: it will never be added twice."
- Pressing Save again, with the form unchanged, saves it once. If the first save went through, the person sees it as
  saved, the same as if the first answer had arrived: a customer, part, bin or photo is never added twice, and stock is
  never set twice.
- Saving again a change to a customer or a part whose first save went through shows it as saved, never "someone else
  changed this record".
- If the person changed something before saving again and the first save went through, the page says "Your first save
  went through" and opens the saved record as it now is, so they can make the change there. If the first save never
  arrived, the changed form is saved.
- Pressing Save twice quickly, or saving again while the first save is still running, saves it once.
- Saving again stays safe for 24 hours after the first press. After that, Save is a new save.
- A save told "busy" (ACME-122) and a save refused for a reason the person can fix (a missing field, a part number
  already in use) behave as they do today.
- Two people adding the same customer at the same time are still two saves: this ticket is about one person's one
  save, not about spotting duplicate customers.

## How we will check

- As `sam` at Northside, add a customer and make the save lose its answer (the page loses its connection just after
  Save is pressed). The form keeps every field and shows the message. Reconnect and press Save again: the customer is
  saved, and the customer list shows them once.
- Do the same, but change the phone number before saving again: the page says the first save went through and opens
  the customer with the first phone number.
- Do the same for a change to a part, for setting a part's stock, and for adding a part photo: each is saved once,
  and the change to the part never says someone else changed it.
- Double-click Save on a new bin: one bin is added.
- With the connection steady, every save behaves as it does today.

## Not in this ticket

- How the system decides it is busy, and what the desk sees then (ACME-121, ACME-122).
- Spotting a customer who is already on file (two people, or two visits, adding the same person).
- Saves that the page sends again by itself: the person always presses Save again.
