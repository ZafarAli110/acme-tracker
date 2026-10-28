---
type: story
---

# ACME-107 Add a new part, with its photos, on its own page

**Requested by** Alice (Dealer Admin), for the parts counters at Northside and Riverside

> The counter keys in new parts from the supplier's delivery note. The "New part" box closes if you click anywhere
> outside it, and everything typed is gone; that happened three times last Monday with a 40-line delivery. Then the
> photos have to be added afterwards on the part's page, so half our new parts never get one, and the counter cannot
> tell two similar belts apart. And when a save went wrong last month we found a part with no photo, and photos in the
> system that belonged to no part at all.

## What we want

Adding a part, photos included, happens on a page of its own and is saved in one go, like editing a part already is.

## Acceptance criteria

- The Parts list has a **New part** button for people who can add parts. It opens the New part page at its own address
  (`/parts/new`); the browser's back button returns to the list.
- The page asks for what we ask today: part number, description, unit price, the bin at this location, quantity on hand
  and reorder level. Part numbers are capitals, digits and dashes; lower case typed is turned into capitals.
- Photos can be added on the same page, up to 10, and one of them is the default photo (marked with a star, as on the
  part's page). Nothing is stored until Save.
- **A save is all or nothing.** If the part cannot be created (for example the part number already exists), none of its
  photos are kept. If one of the photos cannot be stored, the part is not created either, and the message says which
  photo and why. We must never end up with a part missing the photos that were added, or with photos that belong to
  no part.
- When Save is pressed, mistakes are shown next to the field they belong to, before anything is sent: missing values,
  a negative price or one with more than two decimals, quantities that are not whole numbers of 0 or more, and photos
  that are not images or are larger than 10 MB. An empty price is a mistake, never a price of 0.
- If the part number already exists, the message appears under the part number, and everything typed and every photo
  added is kept.
- Save cannot create the part twice, however quickly it is pressed.
- Leaving the page with unsaved changes (Cancel, the back button, a menu link, closing the tab, or switching location
  in the top bar) asks first. With nothing typed, it does not ask. After a successful save, it does not ask.
- After saving, the user lands on the new part's page, with its photos, and the part is in the Parts list without
  refreshing.
- The old "New part" box is gone.

## How we will check

- As `alice` at Northside: open New part from the list, type a part number and press back; the page asks before
  leaving.
- As `alice`: save with the price empty; the price field says it is required and nothing is created.
- As `alice`: add two photos and save with part number `brk-pad-001`; it shows as `BRK-PAD-001`, the message under it
  says the part already exists, the other fields and both photos are still there, and no photo was stored anywhere.
- As `alice`: save a new part with two photos, the second one starred; the new part's page opens with both photos and
  the second as the default, and going back to Parts shows the part with that photo.
- As `alice`: start a part at Northside, switch to Riverside in the top bar; the page asks first, and after switching
  the bins offered are Riverside's.

## Technical notes (tech lead)

Build it like the part's edit page (`web/app/pages/parts/PartEdit.tsx` and `PartForm.tsx`), the way
`docs/standards/web-architecture.md` describes: a route module with `clientLoader` (the bins) and `clientAction`
(the save), React Hook Form with Valibot, TanStack Query, translations in English and French. Do not copy
`PartCreateDialog`. The service side follows `docs/standards/file-uploads.md` ("Saving a record together with its
files"), as `UpdatePartCommandHandler` does.
