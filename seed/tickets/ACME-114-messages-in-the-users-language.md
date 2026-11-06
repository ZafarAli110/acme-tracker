---
type: story
---

# ACME-114 Messages from the server in the user's language

**Reported by** Claire (Service Advisor, Westgate), via the service desk:

> I use the app in French. The screens are French, but when something goes wrong the message is in English: "Customer
> was not found at this location", "Each column can be in the file once", or a list of fields with English names. My
> colleagues who don't read English call me over every time.

## Acceptance criteria

- Every message the server sends that a person reads (errors, refusals, the reasons a form was not saved, export
  failures) is in the language the app is set to, English or French.
- A field named in a message uses the name the screen shows, in that language.
- A language the server does not have falls back to English, never to a missing text.
- What the server writes to its own logs stays in English, so the support team can read it.

## How we will check

- Set the app to French. As `rita`, save a customer with no surname, open a customer from another location, and start
  an export with a column twice: each message is in French and names the field as the screen does.
- Set the app to English and repeat: the same messages, in English.
- Ask in a language the app does not offer: the messages are in English.
