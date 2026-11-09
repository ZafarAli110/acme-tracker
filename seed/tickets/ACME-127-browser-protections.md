---
type: story
---

# ACME-127 The browser protects the desk: no framing, only our own code, uploaded files never run

**Requested by** Ahmed (Tech Lead), after the group's security scan

> The scan came back with a list of missing browser protections on every page of the DMS. None of them is a bug we
> can see today, but each one is a door left open: another site could show our pages inside its own and trick someone
> into clicking, and a photo someone uploaded could be opened as a page. I want every door shut before we go live.

Every answer the DMS sends tells the browser how to protect the person using it: the DMS is never shown inside
another site, its pages run only the system's own code, an uploaded file is never treated as a page, and addresses
inside the system are not passed to other sites.

## Acceptance criteria

- No other website can show a DMS page inside its own page. Trying shows the browser's own refusal, not the DMS.
- DMS pages run only the system's own code. Code from anywhere else, or code slipped into a page (in a customer's
  name, say), is refused by the browser and never runs.
- An uploaded file (a part photo) and a downloaded export are only ever shown or saved as what they are: a photo whose
  contents are really a web page is never opened as one.
- When someone follows a link from the DMS to another site, that site is not told which DMS page they came from.
- The browser keeps to secure connections for the DMS, as it does today.
- Every page and every feature works as it does today, in English and French: nothing the system does itself is
  blocked.
- The group's security scan, run again, reports none of these protections missing.

## How we will check

- Run the group's security scan against a production-like run: no missing browser protection is reported.
- Open a page on another site that tries to show the DMS inside it: the browser refuses.
- As `sam` at Northside, add a customer whose name contains a piece of script. The name shows as typed, as plain
  text, and nothing runs.
- Upload a part photo that is really a web page under a photo's name: opening it never shows it as a page.
- Go through every page as `sam` and as `maria`, in English and French: everything works, and the browser reports
  nothing blocked.

## Not in this ticket

- Adding any outside service to the pages (analytics, a chat widget): its own ticket, with a security sign-off.
- Letting a partner site show the DMS inside its own page: nobody has asked for it.
