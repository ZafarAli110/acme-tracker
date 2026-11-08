---
type: story
---

# ACME-116 Prices and stock value, right to the penny

**Requested by** Maria (Service Manager, Northside and Riverside)

> Our accountant asked what the parts on our shelves are worth at each location, and I had to add it up in a
> spreadsheet. Next year we start quoting and invoicing from Acme, with VAT and discounts, and a total that is a penny
> out on an invoice is a customer on the phone and a question from the auditor. And why does the Parts list show
> prices in dollars? We are a British dealer.

Every price, and every amount worked out from prices, is exact to the penny, in pounds, everywhere it appears.

## Acceptance criteria

- Prices are shown in pounds (£) in English and in French, everywhere a price appears.
- A price can be at most two decimals. A price with more (49.999) is refused with a message saying so; it is never
  quietly rounded to something else.
- A price is shown, edited, stored and given back exactly as it was entered: 0.10, 45.50 and 1,234,567.89 come back
  unchanged.
- The Parts list shows each part's stock value at this location: how many we have here times its price.
- Above the list, the stock value of the whole location: the sum of every part's stock value here, to the penny,
  including the parts on the other pages of the list.
- The location's stock value is exactly the sum of the parts' stock values: never a penny more or less, however many
  parts there are.
- Another location's stock is never in this location's value.
- A part with nothing in stock here has a stock value of £0.00.

## How we will check

- As `maria` at Riverside: add a part priced 0.10 with 3 in stock; its stock value is £0.30, not £0.30000000000000004
  or £0.29. Add one priced 0.20 with 1 in stock; the location's value goes up by exactly £0.50 in total.
- Enter a price of 49.999: it is refused and says why. Enter 45,50 in French: it is saved as 45.50.
- Edit a part priced 1,234,567.89 without changing the price: it is still 1,234,567.89.
- Add up every part's stock value at Riverside by hand (or in a spreadsheet from the list): it matches the location's
  stock value exactly. Switch to Westgate: a different value, and none of Riverside's parts in it.
- In French, prices read like 45,50 £.
