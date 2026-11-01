---
type: bug
---

# ACME-109 Two people edit the same customer and one change disappears

**Reported by** Maria (Service Manager), via the service desk:

> On Monday Sam updated Jonas Berg's phone number while I was changing his town on my screen. I saved after Sam. Jonas
> rang on Thursday: nobody could reach him, because his old number was back. Nothing told either of us anything.

Both saves said they worked. The second one quietly put back everything the first had changed. With six people at
the desk on a busy morning this will happen again, and we only find out when a customer complains.

## Acceptance criteria

- When someone else has saved a customer since you opened it, your save is refused. Nothing they saved is lost.
- The refusal says that someone else changed the customer, and lets you load the latest version before you try again.
- When nobody else has saved in between, saving works exactly as it does today.
- This must hold however the change is saved, not only on the customer screen.

## How we will check

- As `sam` and `maria`, both at Northside, open Jonas Berg at the same time. Sam changes the phone number and saves.
  Maria changes the town and saves: her save is refused and she is told why. After reloading, Sam's phone number is
  there, and Maria can make her change again.

## Not in this ticket

- Merging the two changes automatically.
- Locking a customer while someone has them open.
