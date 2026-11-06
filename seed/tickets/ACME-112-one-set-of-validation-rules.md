---
type: story
---

# ACME-112 One way of writing the rules for what a request may contain

**Requested by** Ahmed (Tech Lead)

> The web app's forms and the service behind them describe the same rules (a surname is required and at most 100
> characters, a price is not negative) in two different styles. When someone changes one, the other is easy to forget:
> last month a form let through a value the service then refused, and the user saw a bare "Bad request". The framework
> we build the service on now accepts rules written the way our forms already write them.

## Acceptance criteria

- The service's rules for every request are written in the same style as the web app's form rules.
- Every request the service refuses today it still refuses, with the same status and the same field named; every
  request it accepts today it still accepts.
- A field that can be left out, cleared or set on an edit still behaves in exactly those three ways.
- The service's API documentation still lists every field, whether it is required, and its limits.
- Uploads with a record (a part with its photos) are checked by the same rules as before.

## How we will check

- Send each endpoint a request with a missing required field, one too long, and one with an unknown field: the answers
  are the same as before the change, field for field.
- Edit a customer three times: leaving a field out keeps it, clearing it empties it, a value sets it.
- Open the API documentation page and compare each request with the version before: nothing is missing.
