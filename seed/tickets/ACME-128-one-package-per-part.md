---
type: story
---

# ACME-128 Each part of the system ships as one package that runs the same everywhere

**Requested by** Owais (Operations)

> To put the DMS on a server today, someone has to install the right versions of three or four tools and build it
> there, and what runs in production is not quite what ran in testing. I want a package for each part of the system,
> made once, checked once, and run as it is on any platform we choose: what we tested is what goes live.

Each part of the system (dealership, documents, sign-in, the gateway, the web pages, the export worker and the update
step from ACME-126) is made into a standard package (a container image) that runs on any container platform. Every
change checks that the packages still build; a release publishes them with its version.

## Acceptance criteria

- Every part of the system has its own package, and each runs on a machine with nothing installed but a container
  runtime.
- The same package goes to testing and to production: what differs is only the settings the platform gives it (where
  the database is, keys and passwords). No password or key is ever inside a package.
- A package says when it is ready and when it is healthy, so the platform knows when to send it work and when to
  restart it.
- A package stops cleanly when the platform asks: work in progress finishes, as when the system stops today.
- Packages are small and hold only what the part needs to run, not the tools used to build it, and do not run with
  the machine's full rights.
- Every change to the code builds every package; a package that does not build stops the change, like a failing test.
- A tagged release publishes every package with that release's version, so Operations can say exactly which version
  is running and go back to an earlier one.
- Developers keep running the system as they do today: the packages are for testing and production.

## How we will check

- On a clean machine with only a container runtime, start the released packages with the written settings: sign in
  as `sam` at Northside, add a customer, upload a part photo and download an export. Everything works.
- Start the same packages with testing's settings, then production's: only the settings differ.
- Look inside a package: no password or key, and no build tools.
- Break the build of one part in a change: the change is stopped with that part named.
- Tag a release: every package appears in the registry with its version.

## Not in this ticket

- Choosing the platform, and the files that deploy to it (each platform gets its own ticket).
- How a new version is put out without anyone noticing (ACME-126); the update step's package is in this ticket.
