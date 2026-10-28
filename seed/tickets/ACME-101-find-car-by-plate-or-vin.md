---
type: story
---

# ACME-101 Find the customer's car by its plate or VIN

**Requested by** Sam (Service Advisor, Northside)

> Half our customers turn up at the desk and say "it's the silver Golf, AB12 CDE". I then scroll the customer list,
> guess the name, and ask them to spell it. On a Monday morning with six people queuing, that is ten minutes we do not
> have. I want to type the plate and have the customer in front of me.

Today we only keep the customer. We know nothing about their cars, so every visit starts from scratch.

## What we want

The service desk records the cars each customer brings in, and finds a customer from their car.

## Acceptance criteria

- On a customer, the desk can add a car with its **VIN**, **registration plate**, make, model, year and current
  mileage. A customer can have several cars.
- The customer's page lists their cars.
- Searching by plate or by VIN finds the car and its owner. Customers say plates in any form, so `ab12cde`, `AB12 CDE`
  and `ab12 cde` all find the same car.
- A VIN is 17 characters, letters and digits only, and never contains I, O or Q. A wrong VIN is refused with a message
  that says what is wrong with it.
- The same car cannot be registered twice anywhere in our dealer group. If Sam enters a VIN that is already on file at
  another of our locations, they are told the car is already registered at that location, but they do not see that
  location's customer.
- The year cannot be in the future and the mileage cannot be negative.

## How we will check

- As `sam` at Northside: add a car with plate `AB12 CDE` to Amara Okafor, then search `ab12 cde` and `AB12CDE`; both
  find her.
- As `sam`: enter a VIN with the letter O in it; it is refused and the message says why.
- As `maria` at Riverside: add Amara's VIN to Kemi Adeyemi; it is refused, and the message names Northside but not
  Amara.

## Not in this ticket

- Photos of the car (ACME-102).
- Looking the VIN up with the manufacturer.
