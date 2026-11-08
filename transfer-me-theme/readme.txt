=== Transfer.me Theme ===
Contributors: transferme
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 8.1
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Block theme for a private transfer service in Madeira and Porto Santo, made to present the Transfer.me Booking plugin.

== Description ==

Transfer.me Theme is a block theme (Full Site Editing) that presents the booking form of the Transfer.me Booking plugin. The theme has no booking or pricing logic.

* Home page with hero, booking form, "How it works" in three steps and a trust section.
* "Reservar" page template with the form in the centre.
* Page patterns for About, How it works, Terms of service, Privacy policy (GDPR) and Contact.
* "Book" button fixed at the bottom on mobile.
* Footer with the licence number taken from the plugin settings, contacts and legal links.
* Self-hosted Inter font (WOFF2), no external requests.
* Meta description, Open Graph and schema.org TaxiService, switched off automatically when an SEO plugin is active.
* Portuguese (pt_PT) source strings, with English (en_US) and German (de_DE) translations.

Full documentation in Portuguese: docs/LEIA-ME.md.

== Installation ==

1. In Appearance > Themes > Add New Theme > Upload Theme, upload transfer-me-theme.zip and activate it.
2. Install and activate the Transfer.me Booking plugin, version 1.2 or later.
3. Create the pages listed in docs/LEIA-ME.md. For "Reservar", choose the "Reservar" template.

== Frequently Asked Questions ==

= Does the theme work without the plugin? =

Yes. Where the form would be, it shows a notice asking visitors to get in touch.

= How do I turn off the theme's SEO tags? =

add_filter( 'transfer_me_theme_seo_enabled', '__return_false' );

== Changelog ==

= 1.0.0 =
* First version.

== Copyright ==

Transfer.me Theme, (C) 2026 Transfer.me.
Transfer.me Theme is distributed under the terms of the GNU GPL v2 or later.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

== Resources ==

* Inter, (C) 2016 The Inter Project Authors, https://github.com/rsms/inter
  License: SIL Open Font License, Version 1.1, https://openfontlicense.org
  Source: @fontsource-variable/inter 5.3.0. License file: assets/fonts/inter/OFL.txt

* assets/images/hero.webp, assets/images/og-default.jpg, screenshot.png
  (C) 2026 Transfer.me, drawn for this theme. License: GPLv2 or later.
