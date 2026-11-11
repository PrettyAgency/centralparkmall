# Central Park Mall website

Static HTML, CSS and JavaScript build of the Central Park Mall redesign by PRETTY Advertising Agency.
No framework and no build step: every page is a plain `index.html` file, so the repository can be deployed as-is to IIS (or any static host).

## Structure

```
/                         Homepage (index.html)
/shop/  /eat/  /play/     Directory landing pages with search and category filters
/shop/<store>/ ...        34 store, restaurant and venue profiles
/whats-on/                Events and offers
/whats-on/vivid-sydney/   Event detail template
/visit/  /contact/  /leasing/  /privacy/
/zh/                      Chinese (Simplified) page
404.html                  Custom not-found page
assets/css/main.css       Shared styles (header, footer, design tokens, components)
assets/css/<page>.css     Page-specific styles
assets/js/main.js         All interactivity (menus, filters, live open/closed status in Sydney time, forms)
assets/img/               Photos as .webp with .jpg fallback, logos in assets/img/logos/
robots.txt, sitemap.xml   Search engine files (sitemap includes en-AU / zh-Hans hreflang)
web.config                IIS settings: 301 redirects, HTTPS/www, 404 page, compression, caching, security headers
```

## Deploying to IIS

1. Install the **IIS URL Rewrite module** on the server. `web.config` depends on it; without it every request returns a 500 error.
2. Point the IIS site at the repository root.
3. Static compression must be installed as an IIS role feature for `urlCompression` to take effect.
4. The HTTPS and `www` redirect only fires for `centralparkmall.com.au` and `www.centralparkmall.com.au`, so staging and local hosts are not redirected. If SSL is terminated at a load balancer, replace the `{HTTPS}` condition with `{HTTP_X_FORWARDED_PROTO}`.

## Redirects from the old Kentico site

`web.config` 301-redirects 76 old page URLs (with or without `.aspx`) and the old `?category=N` links to the new pages. Keep these in place for at least 12 months after launch, then check Google Search Console for any old URLs still being requested.

## Before launch - needs the client

- **Forms**: the newsletter, contact and leasing forms have `action="#"` and show a thank-you message in the browser only. Nothing is sent. Set each form's `action` to a real endpoint (CRM, form service or server script) before going live.
- **Privacy policy**: copied from the current site (Fortius Funds Management). Confirm it is still the correct entity and contact.
- **Disclaimer**: the current site's disclaimer belongs to a previous property developer, so it was not carried over. `/Disclaimer` currently redirects to `/privacy/`.
- **Chinese page**: the existing Chinese copy is kept. New labels and buttons were drafted for this build and need a review by a fluent speaker.
- **Store data**: confirm W Cosmetics and Spin Panda levels, Anytime Fitness location (Shop R110), and hours for Fresh & Hot Ma La Tang and Chef's Academy (shown as "to be confirmed").
- **Public holiday hours, accessibility details and floor plans**: placeholders are on `/visit/`.
- **Leasing contact**: confirm Simon Johnson, PEX Property Group, +61 422 852 852.
- **Hero photo**: the homepage hero is the best available photo but is lower resolution than ideal for large screens.
- **Google Tag Manager**: the existing container `GTM-WZZXSZC` is included on every page. If a Content Security Policy is added later, allow the GTM and Google Fonts domains.

## Updating content

Store details live in each store's `index.html`, plus its card on `/shop/`, `/eat/` or `/play/` and the search list on the homepage (the `tenant-data` JSON block). When adding or removing a store, also update `sitemap.xml` and its `lastmod` dates.
