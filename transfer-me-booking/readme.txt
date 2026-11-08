=== Transfer.me Booking ===
Contributors: transferme
Tags: booking, transfer, taxi, distance pricing, madeira
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 8.1
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Private transfer bookings with road-distance pricing, guest checkout and a driver dashboard.

== Description ==

Transfer.me Booking lets customers book a private transfer in Madeira and Porto Santo without creating an account.

* Address autocomplete through a REST endpoint on your own site. The Google key never reaches the browser.
* Price by road distance: trip distance times the price per km, plus a pickup charge from the driver's current position after a free radius, with a minimum total.
* A quote is valid for 10 minutes and the booking keeps that fixed price.
* When no driver position is available, the customer can still send the request and the price is confirmed later.
* Customers follow or cancel their booking through a private link. The link can be recovered with the booking code and phone number.
* The driver dashboard at /motorista shares the driver's position every 60 seconds while on duty. Only the last position is kept and it is deleted when going off duty.
* Personal data export and erasure through the WordPress privacy tools. Bookings are deleted after the retention period.

Full documentation in Portuguese is in docs/LEIA-ME.md.

== External services ==

This plugin connects to Google Maps Platform from your server to find addresses, convert them to coordinates and measure road distances.

* Places API (New), places.googleapis.com: the text the customer types in an address field and an autocomplete session token, while typing; the selected place ID when a quote is requested.
* Routes API, routes.googleapis.com: the coordinates of the driver, the pickup and the destination, when a quote is requested.
* Geocoding API, maps.googleapis.com: the customer's coordinates, only when the customer presses "use my location".

No customer name, phone or email is sent to Google. Requests use the server key set in the plugin settings.
Google terms of service: https://cloud.google.com/maps-platform/terms
Google privacy policy: https://policies.google.com/privacy

== Installation ==

1. Upload the transfer-me-booking folder to wp-content/plugins/ or install the zip file.
2. Activate the plugin. The pages /transfers and /motorista and the role "Motorista de transfers" are created.
3. In Transfer.me > Settings, fill in prices, the Google server key, licence number and notification email.
4. Enable Places API (New), Routes API and Geocoding API in Google Cloud and restrict the key to the server IP and to these three APIs.

== Changelog ==

= 1.2.0 =
* New: "Formulário de reserva" block (transfer-me/booking-form), so themes can place and style the form in templates and theme.json.
* New: per-field error messages linked with aria-describedby; the submit button is no longer disabled.
* New: .tmb-price class on the price box.
* New: transferme_booking_public_info() for themes (licence number, WhatsApp, VAT note, booking page URL).
* Assets are also loaded when the form is rendered from a template or a block.

= 1.1.0 =
* Fix: registering the bookings post type removed the manage_options capability from administrators.
* Fix: autocomplete sessions are now closed with Place Details, so they are billed as sessions.
* Fix: a zero-metre route (driver already at the pickup) no longer fails the quote.
* Fix: date validation and lead time are checked before the quote is used.
* New: requests with "price to confirm" can be sent.
* New: privacy exporter and eraser, admin columns and booking details.
* New: driver dashboard shows the next 14 days.
* The driver position is no longer stored with each booking.
* Booking and driver pages are excluded from page caches and search engines.

= 1.0.0 =
* First version.
