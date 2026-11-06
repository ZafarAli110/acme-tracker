---
type: story
---

# ACME-113 An export can be downloaded whichever server answers

**Requested by** Owais (Operations)

> We now run the service on two servers so a busy morning doesn't slow everyone down. Since then, about half the time
> Maria presses Download on a finished export and gets "file not found", and pressing it again sometimes works. The file
> is made on one server and asked for from the other.

A finished export must be there for its owner, wherever their request lands.

## Acceptance criteria

- A finished export downloads from any of the servers, every time.
- Where the files are kept is a setting: a folder on a developer's laptop, shared cloud storage in production.
- Files still expire when they do today, and are removed from wherever they are kept.
- Nobody can download someone else's export, as today.

## How we will check

- With two servers running and the files kept in shared storage, start an export as `maria`, then download it ten
  times: every download works, whichever server answers.
- Wait until the export expires: the download says it has expired, and the file is gone from storage.
- As `sam`, try Maria's download link: it is refused.
