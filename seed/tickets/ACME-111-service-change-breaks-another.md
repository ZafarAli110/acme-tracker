---
type: story
---

# ACME-111 A change in one service never breaks another unnoticed

**Requested by** Ahmed (Tech Lead)

> Our services talk to each other in two ways: they call each other, and they send each other messages about photos
> and documents. Today each team writes down what it sends and trusts the other side to read it the same way. If one
> side renames a field, every test still passes, and we find out when photos stop appearing on parts in production.

What each service promises the others must be written once, in a form both sides are checked against, so a change that
would break the other side fails before it is merged, not after it is released.

## Acceptance criteria

- What each service sends and answers to the others is described once, in one place, readable by people and by
  the tests of both sides.
- A change to what a service sends that the other side cannot read fails that service's own checks before merging.
- A change that the other side can still read (a new optional field) passes.
- The written description and what the services really send can never disagree for long: the checks compare them.

## How we will check

- Rename a field in a photo message on the sending side only: the checks fail, and say which field and which side.
- Add a new optional field to the same message on the sending side: the checks pass.
- Change the health answer of one service: its checks fail until the description is updated too.
