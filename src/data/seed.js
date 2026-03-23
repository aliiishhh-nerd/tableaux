export const SEED_IMAGES = [
  { u: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', l: 'Fine Dining' },
  { u: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', l: 'Spread' },
  { u: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80', l: 'Drinks' },
  { u: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', l: 'Fresh' },
  { u: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80', l: 'Simple' },
  { u: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', l: 'Bowl' },
];

export const SEED_PLACES = [
  { n: 'Alinea',                  a: '1723 N Halsted St, Chicago, IL 60614' },
  { n: 'Avec',                    a: '615 W Randolph St, Chicago, IL 60661' },
  { n: 'Gibsons Bar & Steakhouse',a: '1028 N Rush St, Chicago, IL 60611' },
  { n: 'Girl & the Goat',         a: '800 W Randolph St, Chicago, IL 60607' },
  { n: 'The Purple Pig',          a: '500 N Michigan Ave, Chicago, IL 60611' },
  { n: 'Smyth',                   a: '177 N Ada St, Chicago, IL 60607' },
  { n: 'Nobu Chicago',            a: '155 N Wacker Dr, Chicago, IL 60606' },
  { n: 'RPM Italian',             a: '52 W Illinois St, Chicago, IL 60654' },
  { n: 'Au Cheval',               a: '800 W Randolph St, Chicago, IL 60607' },
  { n: 'Monteverde',              a: '1020 W Madison St, Chicago, IL 60607' },
];

export const SEED_EVENTS = [
  {
    id: 1, title: 'An Evening of Provençal Cuisine', type: 'Dinner Party',
    date: '2026-04-12', time: '19:30', loc: 'River North, Chicago', addr: '', cap: 10,
    vis: 'Public', desc: 'A curated journey through the South of France. Dress: smart casual.',
    host: 'Sophie M.', mine: false,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    invH: "You're Invited", invBg: '#6C5DD3',
    guests: [{ n: 'Lena P.', s: 'approved' }, { n: 'Raj K.', s: 'approved' }, { n: 'Theo B.', s: 'pending' }],
    pot: [],
  },
  {
    id: 2, title: 'Spring Potluck in the Garden', type: 'Potluck',
    date: '2026-04-19', time: '18:00', loc: 'Lincoln Park, Chicago', addr: '', cap: 20,
    vis: 'Public', desc: 'Communal spring celebration. Vegetarian-friendly preferred.',
    host: 'Marcus T.', mine: false,
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    invH: 'Come Gather', invBg: '#FFAB00',
    guests: [
      { n: 'Ada D.', s: 'approved' }, { n: 'Jin L.', s: 'approved' },
      { n: 'Priya S.', s: 'approved' }, { n: 'Olga R.', s: 'pending' },
    ],
    pot: [
      { item: 'Ratatouille', by: 'Priya S.' },
      { item: 'Sourdough', by: 'Jin L.' },
      { item: 'Lemon tart', by: 'Ada D.' },
    ],
  },
  {
    id: 3, title: 'Omakase Night: 8-Course Tasting', type: 'Restaurant',
    date: '2026-05-02', time: '20:00', loc: 'Alinea', addr: '1723 N Halsted St, Chicago, IL 60614',
    cap: 6, vis: 'Request-only', desc: "Reserved the chef's table at Alinea. Expect the extraordinary.",
    host: 'Ada D.', mine: true,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    invH: "You're Chosen", invBg: '#11142D',
    guests: [{ n: 'Yuki T.', s: 'approved' }, { n: 'Marcus T.', s: 'approved' }, { n: 'Lena P.', s: 'pending' }],
    pot: [],
  },
  {
    id: 4, title: 'Midsummer Feast', type: 'Dinner Party',
    date: '2026-06-21', time: '20:00', loc: 'Hyde Park, Chicago', addr: '', cap: 12,
    vis: 'Friends-only', desc: 'Long table under the stars. Scandinavian-inspired menu.',
    host: 'Ada D.', mine: true,
    img: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
    invH: 'Join the Table', invBg: '#4DABF7',
    guests: [{ n: 'Raj K.', s: 'approved' }, { n: 'Sophie M.', s: 'approved' }],
    pot: [],
  },
];

export const SEED_INVITES = [
  { id: 10, ev: 'Rooftop Tapas Night', host: 'Elena V.', date: '2026-04-25', s: 'pending' },
  { id: 11, ev: 'Noodle Night',        host: 'Jin L.',   date: '2026-04-30', s: 'approved' },
];
