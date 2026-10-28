---
type: story
---

# ACME-102 Check-in photos of the customer's car

**Requested by** Maria (Service Manager, Riverside)

> Last month a customer collected her car and said we had scratched the rear door. We were sure it was already there
> when she dropped it off, but we had nothing to show her. We paid for the repair. The advisors walk round every car at
> drop-off anyway; they should take photos on the tablet while they do it.

## What we want

At drop-off, the advisor photographs the car, and the photos stay on the car's record with the date they were taken.

## Acceptance criteria

- When registering a car at the desk, the advisor can attach its check-in photos in the same step and save once.
- **A save is all or nothing.** If the car cannot be saved (for example the VIN is wrong), none of its photos are kept.
  If one of the photos cannot be stored, the car is not saved either, and the advisor is told which photo failed and
  why. We must never end up with a car missing the photos the advisor took, or with photos that belong to no car.
- On an existing car, the advisor can add more photos at a later visit.
- Photos come from tablets and phones: JPEG, PNG and HEIC, up to 10 MB each, up to 12 per visit.
- The car's page shows its photos grouped by visit date, newest visit first. Clicking a photo opens it full size.
- A photo appears as "processing" for a moment, then shows. If a photo cannot be processed, it is marked as failed
  with the reason, and the advisor can remove it.

## How we will check

- As `maria` at Riverside: register a car for Kemi Adeyemi with three photos. Within a minute all three show; none is
  stuck on "processing".
- As `maria`: register a car with a wrong VIN and two photos. The car is refused, and no photos were kept anywhere.
- As `maria`: register a car with two good photos and one 30 MB photo. Nothing is saved, and the message names the
  large photo.
- As `sam` at Northside: add two photos to an existing car; they show under today's date, above the earlier visit.

## Not in this ticket

- Marking damage on a diagram of the car.
- Sending the photos to the customer.
