/*
  The single source of truth for the work.

  Everything — the stack on /projects, each project page, and the admin — reads
  this shape. Keep `slug` stable once a project is live: it is the URL, and it is
  also the view-transition name that morphs the picture from the list into the
  page, so changing it breaks the morph as well as the link.

  `media` is an ordered list of stills and clips. A clip needs `poster` so there
  is something to show before it decodes.
*/
export const projects = [
  {
    slug: 'marrow-and-co',
    n: '001',
    title: 'Launch, start to finish',
    client: 'Marrow & Co',
    line: 'A paper mill going direct',
    disciplines: ['Brand', 'Social', 'Photography'],
    year: '2025',
    cover: '/work/w1.webp',
    brief: 'A hundred-year-old mill had been selling through three wholesalers and wanted its own front door. No brand to speak of, no photography, no list.',
    did: [
      'Identity, palette and the type system',
      'A stills library, shot over two days',
      'Launch campaign across paid social and search',
    ],
    result: [['9 wks', 'brief to launch'], ['1,240', 'first-month orders'], ['£0', 'left on wholesale margin']],
    media: [
      { type: 'image', src: '/work/w1.webp', cap: 'The range, shot flat' },
      { type: 'image', src: '/work/w5.webp', cap: 'Product frames for the shop' },
      { type: 'image', src: '/work/w3.webp', cap: 'Launch stills' },
    ],
  },
  {
    slug: 'ridgeway-tools',
    n: '002',
    title: 'A film for a founder',
    client: 'Ridgeway Tools',
    line: 'Ninety seconds in the workshop',
    disciplines: ['Film', 'Direction'],
    year: '2025',
    cover: '/work/w2.webp',
    brief: 'The founder could hold a room and could not hold a camera. Everything on the site had been written by someone who had never used the product.',
    did: [
      'Two days on location in the workshop',
      'A ninety-second cut and six verticals',
      'Grade matched to the existing brand',
    ],
    result: [['92s', 'the main cut'], ['6', 'verticals, one shoot'], ['3.1×', 'time on the product page']],
    media: [
      { type: 'image', src: '/work/w2.webp', cap: 'On the bench' },
      { type: 'image', src: '/work/w6.webp', cap: 'The room, between takes' },
      { type: 'image', src: '/work/w4.webp', cap: 'Frame from the cut' },
    ],
  },
  {
    slug: 'halden-home',
    n: '003',
    title: 'Spend that paid back',
    client: 'Halden Home',
    line: 'Four platforms down to two',
    disciplines: ['Paid media', 'Analytics'],
    year: '2024',
    cover: '/work/w3.webp',
    brief: 'Eleven thousand a month going out across four platforms, and nobody in the building could say which of them was earning.',
    did: [
      'Rebuilt tracking so the numbers could be trusted',
      'Cut two platforms in the first fortnight',
      'Rewrote the creative around what survived',
    ],
    result: [['−38%', 'spend'], ['+21%', 'revenue'], ['2 of 4', 'platforms kept']],
    media: [
      { type: 'image', src: '/work/w3.webp', cap: 'The creative that stayed' },
      { type: 'image', src: '/work/w1.webp', cap: 'Second round' },
      { type: 'image', src: '/work/w6.webp', cap: 'Retargeting set' },
    ],
  },
  {
    slug: 'peel-and-stone',
    n: '004',
    title: 'Ranking for the hard one',
    client: 'Peel & Stone',
    line: 'Page four to position three',
    disciplines: ['Search', 'Content'],
    year: '2024',
    cover: '/work/w4.webp',
    brief: 'One search term the whole business depended on, and page four for two years running.',
    did: [
      'Technical audit and a rebuild of the templates',
      'Eleven pages written properly, not spun',
      'Cleared a decade of redirect debt',
    ],
    result: [['#3', 'from page four'], ['7 mo', 'to get there'], ['+64%', 'non-brand traffic']],
    media: [
      { type: 'image', src: '/work/w4.webp', cap: 'The template, rebuilt' },
      { type: 'image', src: '/work/w2.webp', cap: 'Photography for the guides' },
      { type: 'image', src: '/work/w5.webp', cap: 'Product detail' },
    ],
  },
  {
    slug: 'ambit-skincare',
    n: '005',
    title: 'Shelf to screen',
    client: 'Ambit Skincare',
    line: 'Forty-two SKUs, one setup',
    disciplines: ['Photography', 'Retouch'],
    year: '2024',
    cover: '/work/w5.webp',
    brief: 'Product frames shot on a phone against a bedsheet. The listing was fine. Nobody was buying.',
    did: [
      'Studio days for forty-two SKUs',
      'One lighting setup, held across the range',
      'A retouch spec the client can hand to anyone',
    ],
    result: [['42', 'SKUs'], ['+28%', 'conversion'], ['1', 'setup, reused since']],
    media: [
      { type: 'image', src: '/work/w5.webp', cap: 'The hero frame' },
      { type: 'image', src: '/work/w4.webp', cap: 'Range shot' },
      { type: 'image', src: '/work/w1.webp', cap: 'Texture detail' },
    ],
  },
  {
    slug: 'the-fold-bakery',
    n: '006',
    title: 'A year of always-on',
    client: 'The Fold Bakery',
    line: 'Fifty-two weeks without a gap',
    disciplines: ['Social', 'Content'],
    year: '2023',
    cover: '/work/w6.webp',
    brief: 'Three sites, one oven, and a feed that went quiet every time it got busy.',
    did: [
      'A weekly shoot rhythm the kitchen could actually keep',
      'Twelve months planned a quarter ahead',
      'Community handled by us, not a bot',
    ],
    result: [['52 wks', 'unbroken'], ['×4.6', 'followers'], ['18%', 'of covers from the feed']],
    media: [
      { type: 'image', src: '/work/w6.webp', cap: 'Morning bake' },
      { type: 'image', src: '/work/w3.webp', cap: 'The counter' },
      { type: 'image', src: '/work/w2.webp', cap: 'Front of house' },
    ],
  },
];

export const bySlug = (slug) => projects.find((p) => p.slug === slug);
export const neighbours = (slug) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
};
