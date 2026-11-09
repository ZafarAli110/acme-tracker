---
type: story
---

# ACME-126 A new version goes out during the day, and a failed update never takes the system down

**Requested by** Owais (Operations)

> Today each part of the system changes its own database when it starts. If that change is slow, the new servers sit
> there not starting; if it fails, every server fails with it, and the desks are down until someone fixes it. So we
> only dare update at night. I want to put out a new version at eleven in the morning without anyone at a desk
> noticing, and if an update goes wrong, the running system should not even know.

Updating the database becomes a step of its own, run once before the new version starts. The desks keep working
while it runs and while the new version takes over, and a failed update leaves the running system as it was. This
covers the whole system: dealership, documents, sign-in and the gateway.

## Acceptance criteria

- An update first changes the databases, once, as a step of its own; only then does the new version start. The
  servers no longer change their database when they start.
- During an update the desks keep working: no request fails and no one is signed out, while the database changes and
  while the new version takes over from the old.
- The old and the new version work side by side for as long as an update takes. A change that would break the old
  version (removing or renaming something it uses) is split across two updates: the new thing is added in one, and the
  old one removed in a later one.
- A slow database change (an index over the full parts catalogue, say) does not hold the desks up while it runs.
- If the database change fails, nothing new starts, the running system carries on as it was, and Operations is told
  what failed and why.
- Running the update step twice, or on two machines at once, changes each database once.
- The running system can read and save data but cannot change the shape of its own tables. Only the update step can,
  with its own sign-in.
- Operations has one written routine for putting out a version, the same for every part of the system.

## How we will check

- During the busy-morning check (ACME-117) at a calm rate, put out a version whose update adds something to the parts
  catalogue. Every request is answered, nobody is signed out, and the new version is running at the end.
- Put out a version whose database change is broken on purpose. The update stops and says why, the running system
  answers as before, and nothing of the new version is running.
- Run the update step twice in a row: the second time it says there is nothing to do.
- Using the system's own sign-in to the database, try to add a column to the customers table: it is refused.
- Follow the written routine from a clean start, without help.

## Not in this ticket

- Building the system into a package that runs the same everywhere (a container image).
- Rolling back to the previous version after a successful update.
- Background jobs on several servers: they already run safely on every server.
