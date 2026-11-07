---
type: story
---

# ACME-115 Signing out ends my sign-in in every open tab, straight away

**Reported by** Maria (Service Manager), via the service desk:

> At the front desk we share one computer, and most of us keep two or three tabs of the app open: the parts list in
> one, a customer in another. When I sign out at the end of my shift I need to know that I am really out, everywhere,
> before Rita sits down. Today I'm never quite sure: I click Sign out and wait, and I don't know whether the other tabs
> are still signed in as me.

Signing out must end the sign-in for the whole browser, at once, and every open tab must show that. The next person
must be able to sign in as themselves without waiting.

## Acceptance criteria

- Signing out takes me to the sign-in page straight away.
- Every other open tab of the app goes to the sign-in page too, without me touching it.
- After signing out, reloading any tab, or opening the app in a new tab, shows the sign-in page straight away, with
  nobody signed in.
- It makes no difference which tab I sign out from, or what that tab or the others were showing.
- The next person can sign in at once, as themselves, in any tab, and every tab then shows them, not me.

## How we will check

- As `maria`, open the app in three tabs: Home, the parts list and a customer. Sign out in one of them. That tab and
  the other two show the sign-in page, straight away.
- Reload each tab, and open the app in a fourth: each shows the sign-in page straight away, and nobody is signed in.
- Sign in as `rita` in one tab: she is signed in, and the other tabs show her, not Maria.
- Do it again, signing out from a different tab.

## Not in this ticket

- Signing out on other computers or browsers.
- Signing someone out automatically after a period of inactivity.
