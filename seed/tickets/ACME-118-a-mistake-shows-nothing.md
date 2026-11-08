---
type: story
---

# ACME-118 A mistake in the system shows nothing, never another dealer's customers

**Requested by** Maria (Service Manager, Northside and Riverside), for the group's data protection review

> Our auditor asked a simple question: "If a programmer makes a mistake, what is the worst a user could see?" The
> answer today is "possibly every dealer's customers", because in the background the system can see everything and
> only narrows it down for each request. City Motors is a different company: they must never see one of our
> customers, and we must never see theirs, not even for a moment and not even by mistake.

The system starts from seeing nothing and is given exactly what each person may see, so a mistake can only ever show
less, never more.

## Acceptance criteria

- Every list, search, record, export and count still shows exactly what it shows today, for every user.
- A part of the system that forgets to say whose data it wants gets nothing back and reports it, rather than getting
  every dealer's data.
- Only the few jobs that truly need all dealers' data (preparing the database, the background export, messages from
  other services) can see it, each one deliberately and named in the code, and no person's request ever runs as one.
- Someone connecting to the database with the system's everyday credentials (a reporting tool, a script) sees nothing
  until a dealer and location are set.
- Nothing becomes noticeably slower.

## How we will check

- As `maria`, `sam`, `rita` and `tom`: open Customers, Parts, Stock and Exports at each of their locations, search,
  sort, open a record and download an export. Everything is exactly as before, and `tom` never sees Northwind's data.
- Ask the development team to break one screen on purpose, so that it forgets whose data to show: the screen shows
  nothing (or an error), never another location's or another dealer's rows.
- Connect to the database with the system's everyday credentials and list the customers without setting a dealer:
  no rows.
- The busy-morning check (ACME-117) shows the same speed as before.
