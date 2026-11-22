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
        { key: 'grey', label: 'Grey Marl', hex: '#b7b7b5', cut: 'hoodie-grey', on: 'hoodie-grey', shopify: { S: 68525062324451, M: 68525062357219, L: 68525062389987, XL: 68525062422755 } },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'hoodie-black', on: 'hoodie-black', shopify: { S: 68525062455523, M: 68525062488291, L: 68525062521059, XL: 68525062553827 } },
        { key: 'brown', label: 'Brown', hex: '#5b4c3e', cut: 'hoodie-brown', on: 'hoodie-brown', shopify: { S: 68525062586595, M: 68525062619363, L: 68525062652131, XL: 68525062684899 } }
      ]
    },
    {
      id: 'knit-zip-jacket', no: '02', name: 'Knit Zip Jacket', type: 'Jackets', price: 0,
      blurb: 'A textured knit with a wide zip collar and a full-length metal zip. Fitted and cropped.',
      details: ['Wide zip collar', 'Full-length metal zip', 'Fitted, cropped body', 'Fabric and care: coming soon'],
      colors: [
        { key: 'black', label: 'Black', hex: '#161616', cut: 'zip-jacket-textured-black', on: null, shopify: {} },
        { key: 'brown', label: 'Chocolate', hex: '#3f2219', cut: 'zip-jacket-boucle-brown', on: null, shopify: {} }
      ]
    },
    {
      id: 'knit-polo', no: '03', name: 'Knit Polo', type: 'Knitwear', price: 0,
      blurb: 'Long-sleeve knit polo with a three-button placket. Soft, structured, easy to dress up or down.',
      details: ['Three-button placket', 'Ribbed collar, cuffs and hem', 'Relaxed fit', 'Fabric and care: coming soon'],
      colors: [
        { key: 'black', label: 'Black', hex: '#161616', cut: 'polo-black', on: 'polo-black', shopify: { S: 68525063307491, M: 68525063340259, L: 68525063373027, XL: 68525063405795 } },
        { key: 'brown', label: 'Brown', hex: '#5a2f26', cut: 'polo-brown', on: 'polo-brown', shopify: { S: 68525063438563, M: 68525063471331, L: 68525063504099, XL: 68525063536867 } }
      ]
    },
    {
      id: 'knit-crewneck', no: '04', name: 'Knit Crewneck', type: 'Knitwear', price: 0,
      blurb: 'The everyday knit. Ribbed crew neck, dropped shoulders and a clean, boxy line.',
      details: ['Ribbed crew neck', 'Dropped shoulders', 'Boxy fit', 'Fabric and care: coming soon'],
      colors: [
        { key: 'chocolate', label: 'Chocolate', hex: '#4b241c', cut: 'crewneck-chocolate', on: 'crewneck-chocolate', shopify: { S: 68525063569635, M: 68525063602403, L: 68525063635171, XL: 68525063667939 } },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'crewneck-black', on: 'crewneck-black', shopify: { S: 68525063700707, M: 68525063733475, L: 68525063766243, XL: 68525063799011 } }
      ]
    },
    {
      id: 'striped-off-shoulder', no: '05', name: 'Striped Off-Shoulder Knit', type: 'Knitwear', price: 0,
      blurb: 'Bold stripes on a one-shoulder knit, gathered at the waist with a deep rib.',
      details: ['One-shoulder neckline', 'Deep ribbed waistband', 'Cropped fit', 'Fabric and care: coming soon'],
      colors: [
        { key: 'brown', label: 'Brown / Sky', hex: '#4b2a20', hex2: '#8fb3e3', cut: 'stripe-brown', on: 'stripe-brown', shopify: { S: 68525063995619, M: 68525064028387, L: 68525064061155, XL: 68525064093923 } },
        { key: 'navy', label: 'Navy / Sky', hex: '#1d2535', hex2: '#a9c8ee', cut: 'stripe-navy', on: 'stripe-navy', shopify: { S: 68525064126691, M: 68525064159459, L: 68525064192227, XL: 68525064224995 } }
      ]
    },
    {
      id: 'knit-henley', no: '06', name: 'Knit Henley', type: 'Knitwear', price: 0,
      blurb: 'A soft, relaxed knit with a short button placket. Quiet, warm, made to layer.',
      details: ['Button placket', 'Collarless neck', 'Relaxed fit', 'Fabric and care: coming soon'],
      colors: [
        { key: 'ivory', label: 'Ivory', hex: '#ece6d6', cut: 'henley-ivory', on: 'henley-cream', shopify: {} },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'henley-black', on: 'henley-black', shopify: {} }
      ]
    },
    {
      id: 'ribbed-henley', no: '07', name: 'Ribbed Henley', type: 'Tops', price: 0,
      blurb: 'A fitted long-sleeve rib with a four-button placket. Clean on its own, easy under a knit.',
      details: ['Four-button placket', 'Fine rib, fitted body', 'Long sleeves', 'Fabric and care: coming soon'],
      colors: [
        { key: 'white', label: 'White', hex: '#f7f7f5', cut: 'rib-henley-white', on: null, shopify: {} },
        { key: 'brown', label: 'Chocolate', hex: '#4b241c', cut: 'rib-henley-brown', on: null, shopify: {} },
        { key: 'black', label: 'Black', hex: '#161616', cut: 'rib-henley-black', on: null, shopify: {} }
      ]
    }
  ],

  /* The order pieces hang on the rail at the top of the page (product id / colour key). */
  rail: [
    ['zip-hoodie', 'grey'], ['knit-zip-jacket', 'black'], ['knit-henley', 'ivory'], ['knit-crewneck', 'chocolate'],
    ['striped-off-shoulder', 'brown'], ['zip-hoodie', 'black'], ['ribbed-henley', 'white'], ['knit-zip-jacket', 'brown'], ['knit-polo', 'brown'],
    ['knit-polo', 'black'], ['striped-off-shoulder', 'navy'], ['zip-hoodie', 'brown'], ['ribbed-henley', 'brown'], ['knit-crewneck', 'black'], ['knit-henley', 'black'], ['ribbed-henley', 'black']
  ],

  /* The big scrolling showcase (giant word behind the piece). */
  showcase: [
    { id: 'zip-hoodie', color: 'grey', word: 'HOODIE' },
    { id: 'knit-zip-jacket', color: 'brown', word: 'JACKET' },
    { id: 'knit-polo', color: 'brown', word: 'POLO' },
    { id: 'striped-off-shoulder', color: 'brown', word: 'STRIPE' }
  ]
};
