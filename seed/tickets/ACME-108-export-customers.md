---
type: story
---

# ACME-108 Export the customer list to Excel

**Requested by** Maria (Service Manager, Northside and Riverside)

> Since we took over the two other dealers, Northside's customer book has over a million names. Head office wants the
> list in Excel every month (who we have not seen for a year, by city), and the mailing house wants it sorted their way.
> Today someone copies it page by page; last month that took two days and the file still had gaps.

## What we want

On the Customers list, an **Export to Excel** button that gives us the list as we are looking at it, as an Excel file.

## Acceptance criteria

- The file holds every customer the list would show with its current search, filter and sort: all of them, not just
  the page on screen, in the same order.
- It has the columns the list is showing, in the same order, with the same headings; columns hidden in the list are
  not in the file.
- Dates are real Excel dates and amounts and numbers are numbers, so they can be sorted and summed in Excel.
- It works for our biggest rooftop. A file that Excel cannot open, or that is missing customers, is not acceptable.
- While the file is being made the person can see that it is working, how far it has got and roughly how long is left.
  They can carry on using the app, and they can cancel it.
- Everyone else keeps working normally while an export runs, including when several people export at once.
- Only customers of the selected location are ever in the file.

## How we will check

Load the large customer book first: `bun run seed:bulk` (Northside gets 1.2 million customers, Riverside 400,000).

- As `maria` at Riverside: filter Status is Active, sort by City, hide Phone. The file has exactly the rows the list
  says (its total), in the same order, without a Phone column.
- As `maria` at Northside, with no filter: the file opens in Excel and holds every Northside customer.
- As `sam` at Northside: start an export and keep working on Parts while it runs; Parts answers as quickly as usual.
- As `maria`: start an export and cancel it; nothing is downloaded.

## Not in this ticket

- Exporting other lists (Parts will follow the same way).
- Scheduled or emailed exports.
