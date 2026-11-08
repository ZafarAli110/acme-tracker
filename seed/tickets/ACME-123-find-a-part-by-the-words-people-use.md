---
type: story
---

# ACME-123 Find a part by the words people use

**Requested by** Maria (Service Manager), for the parts counters at Northside and Riverside

> A customer says "front brake pads for the Focus" and the counter types "brake pads". Today that finds nothing,
> because the catalogue says "Brake pad set, front". So they try "brake", scroll through two hundred parts, and the
> customer waits. With the whole manufacturer catalogue loaded it will only get slower.

The parts search finds a part from the words someone types, in any order and in any form, best match first, and stays
quick with a full catalogue.

## Acceptance criteria

- Every word typed must appear in the part, in any order: "pads brake front" finds "Brake pad set, front".
- A word finds its other forms: "pads" finds "pad", "filters" finds "filter".
- The last word counts while it is still being typed: "brake pa" already finds brake pads.
- A part number typed in full, or its beginning ("BRK-PAD"), still finds that part, first.
- Results come best match first: a part-number match, then the parts whose description matches the words most
  closely. Sorting by a column still sorts by that column. The list with no search keeps part-number order.
- A search only ever shows the parts this location stocks, as today.
- With a full catalogue (about 60,000 parts a dealer) and the busy-morning load (ACME-117), a search answers about as
  fast as the other lists.
- A search that matches nothing says that no parts match.

## How we will check

- With the large sample data loaded, as `maria` at Northside: search "pads brake front". "Brake pad set, front" shows
  at the top. Search "filters": oil and air filters show.
- Type "brake pa" and pause: brake pads already show.
- Search the start of a part number: that part shows first.
- As `maria` at Riverside: search a part only Northside stocks. It does not show.
- During the busy-morning check, parts searches answer as fast as customer searches.

## Not in this ticket

- Misspelt words ("brkae"). The customer search does that for names (ACME-120).
- Whether other locations have the part (ACME-104, which can reuse this search).

## Open points

- The matched words are not highlighted in the results. If they should be, the list needs a small design.
- Words such as "for", "the" and "and" are ignored ("pads for the Focus" searches "pads Focus"). If that is wrong, a
  search with them would find fewer parts.
