# RUINS — website (Archive 01)

Static site: plain HTML, CSS and JavaScript with GSAP, ScrollTrigger and Lenis (in `vendor/`). No build step.

## Files

- `index.html`: the page.
- `css/style.css`: all styles. The look follows the Lumera + Podval references; its colours and fonts are in the "REFERENCE LOOK" block at the end:
  red-orange `#EC4511`, black `#121212`, grey-blue `#C9D1D4`, crumpled paper, and the orange→red→black glow (`--glow`).
  Fonts: Inter Tight (giant words), Montserrat (bold caps headings and labels), Raleway (thin accents), Instrument Serif italic (the "01").
  The page background is crumpled white paper (`img/paper.jpg`, a seamless tile, set in `--paper-tex`), like the Podval reference.
- `js/products.js`: **every product, colour, price and photo**. Edit this file to change the shop.
- `js/main.js`: entrance, rail, showcase, spin ring, shop grid, product view and bag.
- `img/cut/`: product cut-outs with transparent backgrounds, made from `../assets`.
- `img/on/`: on-body photos.

## Page order

1. Entrance: orange screen, RUINS logo sharpens out of the blur, then the pieces drop onto the rail.
2. The rail (like motion/entrance.MP4): pieces hang side-on as 3D garments; hover turns one to face you; click grows it big in the middle (Choose size opens the product view).
2b. Lumera block: giant orange RUINS on grey-blue with a model, then an orange band with the glow and a blurred model.
3. Showcase: a giant word behind each piece, scrubbed by scroll.
4. Spin: a dot-matrix text ring turning around the piece.
5. Shop all: grid with filters and an on-body photo on hover.
6. About: giant type with photo cards drifting over it.
7. Footer.

## Colour versions

Same site, only the colours change:
- Orange (default): `index.html`
- Green (olive, forest, emerald, teal green): add `?theme=green`
- Brand (the RUINS deck palette: terracotta, mustard, maroon, navy, forest, sage): add `?theme=brand`

The colours are in the "colour versions" block at the end of `css/style.css`. When a `?theme=` is in the address,
a small Orange / Green / Brand switch appears bottom-left to compare them.

## Prices

All products are `price: 0` in `js/products.js`. Change the number to set a price in EGP.

## Linking Shopify (store: ruinsco.myshopify.com)

1. Create each product in Shopify with the same colours and sizes (S, M, L, XL).
2. Copy each variant ID into that colour's `shopify` field in `js/products.js`:
   `shopify: { S: 45123456789, M: 45123456790, L: 45123456791, XL: 45123456792 }`
3. That's it. Checkout sends the bag to Shopify's own checkout through a cart link.
   Until every item in the bag has IDs, Checkout shows "Checkout opens once the shop is linked to Shopify".

## Logo

The site uses **Overlap with a reversed N** (RUIИS), the chosen logo. To preview the old
**M Decay** logo instead, add `?logo=decay` to the end of the address.

## Before launch

- Remove `<meta name="robots" content="noindex">` in `index.html` (marked `TODO(launch)`).
- Fabric and care text: "coming soon" in each product's `details` list.
- Shipping / Returns / Size guide links in the footer show "Coming soon".
- The email sign-up isn't connected yet. Shopify can collect these emails later.
