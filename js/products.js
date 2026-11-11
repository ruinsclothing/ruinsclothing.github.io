/*
  RUINS — product catalogue.
  Everything the site shows comes from this one list.

  Prices: all 0 EGP for now. Change `price` when Ruins sets prices.
  Shopify: when the store is linked, paste each colour's variant IDs into
  `shopify` (one per size), e.g. shopify: { S: 4512..., M: 4512..., L: ..., XL: ... }.
  Checkout then sends the bag straight to Shopify's checkout.

  Images:
    cut = clean product cut-out (img/cut/NAME.webp) — used on the rail.
    on  = on-body photo (img/on/NAME.webp).
*/
window.RUINS = {
  shopDomain: 'ruinsco.myshopify.com',
  currency: 'EGP',
  sizes: ['S', 'M', 'L', 'XL'],
  products: [
    {
      id: 'zip-hoodie', no: '01', name: 'Zip Hoodie', type: 'Hoodies', price: 0,
      blurb: 'Brushed fleece, cut boxy with dropped shoulders. Full-length metal zip and a deep front pocket.',
      details: ['Boxy fit, dropped shoulders', 'Full-length metal zip', 'Ribbed cuffs and hem', 'Fabric and care: coming soon'],
      colors: [
        { key: 'grey', label: 'Grey Marl', hex: '#b7b7b5', cut: 'hoodie-grey', on: 'hoodie-grey', shopify: {} },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'hoodie-black', on: 'hoodie-black', shopify: {} },
        { key: 'brown', label: 'Brown', hex: '#5b4c3e', cut: 'hoodie-brown', on: 'hoodie-brown', shopify: {} }
      ]
    },
    {
      id: 'knit-zip-jacket', no: '02', name: 'Knit Zip Jacket', type: 'Jackets', price: 0,
      blurb: 'A heavy knit with a high zip neck and a two-way zip. Cropped, roomy through the body.',
      details: ['High funnel neck', 'Two-way metal zip', 'Cropped, relaxed body', 'Fabric and care: coming soon'],
      colors: [
        { key: 'brown', label: 'Brown', hex: '#4a2e24', cut: 'zip-jacket-brown', on: 'zip-jacket-brown', shopify: {} },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'zip-jacket-black', on: 'zip-jacket-black', shopify: {} },
        { key: 'charcoal', label: 'Charcoal', hex: '#4b4b4b', cut: 'zip-jacket-charcoal', on: 'zip-jacket-charcoal', shopify: {} }
      ]
    },
    {
      id: 'knit-polo', no: '03', name: 'Knit Polo', type: 'Knitwear', price: 0,
      blurb: 'Long-sleeve knit polo with a three-button placket. Soft, structured, easy to dress up or down.',
      details: ['Three-button placket', 'Ribbed collar, cuffs and hem', 'Relaxed fit', 'Fabric and care: coming soon'],
      colors: [
        { key: 'ivory', label: 'Ivory', hex: '#ece6d6', cut: 'polo-ivory', on: 'henley-cream', shopify: {} },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'polo-black', on: 'polo-black', shopify: {} },
        { key: 'brown', label: 'Brown', hex: '#5a2f26', cut: 'polo-brown', on: 'polo-brown', shopify: {} }
      ]
    },
    {
      id: 'knit-crewneck', no: '04', name: 'Knit Crewneck', type: 'Knitwear', price: 0,
      blurb: 'The everyday knit. Ribbed crew neck, dropped shoulders and a clean, boxy line.',
      details: ['Ribbed crew neck', 'Dropped shoulders', 'Boxy fit', 'Fabric and care: coming soon'],
      colors: [
        { key: 'chocolate', label: 'Chocolate', hex: '#4b241c', cut: 'crewneck-chocolate', on: 'crewneck-chocolate', shopify: {} },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'crewneck-black', on: 'crewneck-black', shopify: {} }
      ]
    },
    {
      id: 'striped-off-shoulder', no: '05', name: 'Striped Off-Shoulder Knit', type: 'Knitwear', price: 0,
      blurb: 'Bold stripes on a one-shoulder knit, gathered at the waist with a deep rib.',
      details: ['One-shoulder neckline', 'Deep ribbed waistband', 'Cropped fit', 'Fabric and care: coming soon'],
      colors: [
        { key: 'brown', label: 'Brown / Sky', hex: '#4b2a20', hex2: '#8fb3e3', cut: 'stripe-brown', on: 'stripe-brown', shopify: {} },
        { key: 'navy', label: 'Navy / Sky', hex: '#1d2535', hex2: '#a9c8ee', cut: 'stripe-navy', on: 'stripe-navy', shopify: {} }
      ]
    },
    {
      id: 'mandarin-top', no: '06', name: 'Mandarin Collar Top', type: 'Tops', price: 0,
      blurb: 'A fitted long-sleeve top with a stand collar and an open V. Clean and sharp on its own.',
      details: ['Stand collar, open V', 'Fitted body', 'Long sleeves', 'Fabric and care: coming soon'],
      colors: [
        { key: 'white', label: 'White', hex: '#f7f7f5', cut: 'mandarin-white', on: 'mandarin-white', shopify: {} }
      ]
    }
  ],

  /* The order pieces hang on the rail at the top of the page (product id / colour key). */
  rail: [
    ['zip-hoodie', 'grey'], ['knit-zip-jacket', 'black'], ['knit-polo', 'ivory'], ['knit-crewneck', 'chocolate'],
    ['striped-off-shoulder', 'brown'], ['striped-off-shoulder', 'navy'], ['zip-hoodie', 'black'], ['knit-zip-jacket', 'charcoal'], ['mandarin-top', 'white'], ['knit-polo', 'brown'],
    ['knit-polo', 'black'], ['zip-hoodie', 'brown'], ['knit-crewneck', 'black'], ['knit-zip-jacket', 'brown']
  ],

  /* The big scrolling showcase (giant word behind the piece). */
  showcase: [
    { id: 'zip-hoodie', color: 'grey', word: 'HOODIE' },
    { id: 'knit-zip-jacket', color: 'brown', word: 'JACKET' },
    { id: 'knit-polo', color: 'ivory', word: 'POLO' },
    { id: 'striped-off-shoulder', color: 'brown', word: 'STRIPE' }
  ]
};
