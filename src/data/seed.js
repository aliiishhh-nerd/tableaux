// ---- SEED DATA ----
// Current user
export const CURRENT_USER = {
  id: 'u1',
  name: 'Ada Chen',
  initials: 'AC',
  handle: '@adachen',
  email: 'ada@tableaux.com',
  bio: 'Home cook obsessed with Sichuan flavors, natural wine, and long dinners with good people.',
  color: 'indigo',
  avatar: null,
  socials: {
    instagram: 'adachen.eats',
    tiktok: 'adachen_cooks',
    x: 'adachen',
    substack: '',
  },
  eventsHosted: 12,
  friendsCount: 48,
  passportCount: 7,
};

// All users (friends)
export const USERS = [
  { id: 'u1', name: 'Ada Chen',     initials: 'AC', color: 'indigo', handle: '@adachen',   bio: 'Sichuan obsessed. Always hungry.', socials: { instagram: 'adachen.eats' } },
  { id: 'u2', name: 'Sophie M.',    initials: 'SM', color: 'coral',  handle: '@sophiem',    bio: 'French cuisine enthusiast & dinner party host.', socials: { instagram: 'sophiem_cooks' } },
  { id: 'u3', name: 'Raj K.',       initials: 'RK', color: 'amber',  handle: '@rajk',       bio: 'Spice merchant. Mumbai → Chicago.', socials: { instagram: 'rajk_spices' } },
  { id: 'u4', name: 'Lena P.',      initials: 'LP', color: 'teal',   handle: '@lenap',      bio: 'Fermentation nerd. Sourdough & kimchi.', socials: { instagram: 'lenap_ferments' } },
  { id: 'u5', name: 'Marcus W.',    initials: 'MW', color: 'sage',   handle: '@marcusw',    bio: 'Wine guy. Natural & biodynamic only.', socials: { instagram: 'marcusw_wine' } },
  { id: 'u6', name: 'Priya N.',     initials: 'PN', color: 'amber',  handle: '@priyan',     bio: 'Pastry chef. Baking is my love language.', socials: { instagram: 'priya_pastry' } },
  { id: 'u7', name: 'James T.',     initials: 'JT', color: 'teal',   handle: '@jamest',     bio: 'Grill master. Smoke everything.', socials: { instagram: 'jamest_bbq' } },
  { id: 'u8', name: 'Yuki S.',      initials: 'YS', color: 'indigo', handle: '@yukis',      bio: 'Ramen & izakaya devotee.', socials: { instagram: 'yukis_ramen' } },
];

// ---- EVENTS ----
const now = new Date();
const hoursAgo = (h) => new Date(now - h * 3600000).toISOString().slice(0, 16).replace('T', ' ');
const daysFromNow = (d) => {
  const dt = new Date(now.getTime() + d * 86400000);
  return dt.toISOString().slice(0, 10);
};
const daysAgo = (d) => {
  const dt = new Date(now.getTime() - d * 86400000);
  return dt.toISOString().slice(0, 10);
};

export const SEED_EVENTS = [
  // ---- ENDED ~18 hours ago — with photos & tags (item #1) ----
  {
    id: 'evt-ended-1',
    title: 'Izakaya Night: Small Plates & Sake',
    type: 'Dinner Party',
    date: daysAgo(0), // today (ended)
    time: '18:30',
    endedHoursAgo: 18,
    isEnded: true,
    loc: 'Wicker Park, Chicago',
    addr: '2152 W North Ave, Chicago, IL 60647',
    cap: 12,
    vis: 'Friends Only',
    desc: 'An intimate Japanese small-plates evening. Yakitori, karaage, pickles, and rare sakes from Kyoto.',
    host: 'Ada Chen',
    hostId: 'u1',
    mine: true,
    img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80' },
    invH: "You're Invited 🍶",
    invBg: '#1A1A2E',
    guests: [
      { id: 'u2', n: 'Sophie M.', s: 'approved', initials: 'SM', color: 'coral' },
      { id: 'u3', n: 'Raj K.',    s: 'approved', initials: 'RK', color: 'amber' },
      { id: 'u4', n: 'Lena P.',   s: 'approved', initials: 'LP', color: 'teal' },
      { id: 'u5', n: 'Marcus W.', s: 'approved', initials: 'MW', color: 'sage' },
      { id: 'u6', n: 'Priya N.',  s: 'approved', initials: 'PN', color: 'amber' },
    ],
    photoGallery: [
      { id: 'ph1', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80', tags: ['Yakitori', 'Grill'], uploadedBy: 'u2', uploaderName: 'Sophie M.' },
      { id: 'ph2', url: 'https://images.unsplash.com/photo-1617196034234-d71b9e31f292?w=600&q=80', tags: ['Sake', 'Drinks'], uploadedBy: 'u3', uploaderName: 'Raj K.' },
      { id: 'ph3', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', tags: ['Karaage'], uploadedBy: 'u1', uploaderName: 'Ada Chen' },
      { id: 'ph4', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80', tags: ['Table Setup'], uploadedBy: 'u4', uploaderName: 'Lena P.' },
      { id: 'ph5', url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80', tags: ['Pickles', 'Sides'], uploadedBy: 'u5', uploaderName: 'Marcus W.' },
    ],
    galleryEnabled: true,
    photoGalleryEnabled: true,
    potluck: null,
    supperClub: null,
  },

  // ---- UPCOMING — Supper Club Series (item #5 special template) ----
  {
    id: 'evt-sc-1',
    title: 'Terroir Vol. III: Burgundy & Bourgogne',
    type: 'Supper Club',
    seriesName: 'Terroir Supper Club',
    seriesVolume: 3,
    date: daysFromNow(12),
    time: '19:00',
    isEnded: false,
    loc: 'Lincoln Park, Chicago',
    addr: '2057 N Halsted St, Chicago, IL 60614',
    cap: 10,
    vis: 'Invite Only',
    desc: 'A five-course journey through Burgundy. Paired wines, seasonal produce, and the story of the land in every bite.',
    host: 'Ada Chen',
    hostId: 'u1',
    mine: true,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
    invH: 'An Evening in Burgundy 🍷',
    invBg: '#2D1B4E',
    guests: [
      { id: 'u2', n: 'Sophie M.', s: 'approved', initials: 'SM', color: 'coral' },
      { id: 'u3', n: 'Raj K.',    s: 'approved', initials: 'RK', color: 'amber' },
      { id: 'u4', n: 'Lena P.',   s: 'pending',  initials: 'LP', color: 'teal' },
      { id: 'u5', n: 'Marcus W.', s: 'approved', initials: 'MW', color: 'sage' },
    ],
    supperClub: {
      hostNote: "I've been dreaming of this menu since our trip through Dijon last autumn. Every dish tells a story of the land — the terroir. I'll be making the Burgundy beef myself starting two days before the dinner. Please arrive hungry.",
      courses: [
        { num: 1, name: 'Gougères & Chablis', desc: 'House-baked gruyère puffs with a crisp, mineral Chablis 1er Cru.', wine: 'Chablis 1er Cru 2022' },
        { num: 2, name: 'Escargots de Bourgogne', desc: 'Wild Burgundy snails baked in herb-garlic butter, served in their shells.', wine: 'Bourgogne Blanc 2021' },
        { num: 3, name: 'Soupe à l\'oignon', desc: 'Three-hour caramelized onion soup, Comté croûton, aged Gruyère gratinée.', wine: 'Chassagne-Montrachet 2019' },
        { num: 4, name: 'Bœuf Bourguignon', desc: 'Braised beef cheek, lardons, pearl onions, mushrooms, Pinot reduction. Slow-cooked 48 hours.', wine: 'Gevrey-Chambertin 2018', highlight: true },
        { num: 5, name: 'Époisses & Honey Comb', desc: 'Cave-aged Époisses de Bourgogne, raw honeycomb, walnut bread, Sauternes.', wine: 'Sauternes 2017' },
      ],
    },
    galleryEnabled: true,
    photoGalleryEnabled: false,
    photoGallery: [],
    potluck: null,
  },

  // ---- UPCOMING PUBLIC EVENT ----
  {
    id: 'evt-pub-1',
    title: 'An Evening of Provençal Cuisine',
    type: 'Dinner Party',
    date: daysFromNow(19),
    time: '19:30',
    isEnded: false,
    loc: 'River North, Chicago',
    addr: '200 W Grand Ave, Chicago, IL 60654',
    cap: 10,
    vis: 'Public',
    desc: 'A curated journey through the South of France. Dress: smart casual.',
    host: 'Sophie M.',
    hostId: 'u2',
    mine: false,
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },
    invH: "You're Invited",
    invBg: '#6C5DD3',
    guests: [
      { id: 'u3', n: 'Raj K.',  s: 'approved', initials: 'RK', color: 'amber' },
      { id: 'u4', n: 'Lena P.', s: 'approved', initials: 'LP', color: 'teal' },
    ],
    galleryEnabled: true,
    photoGalleryEnabled: false,
    photoGallery: [],
    potluck: null,
    supperClub: null,
  },

  // ---- POTLUCK INVITE for current user (item #2) ----
  {
    id: 'evt-potluck-1',
    title: "Friendsgiving Potluck 🍂",
    type: 'Potluck',
    date: daysFromNow(9),
    time: '16:00',
    isEnded: false,
    loc: 'Bucktown, Chicago',
    addr: '1634 N Damen Ave, Chicago, IL 60647',
    cap: 18,
    vis: 'Friends Only',
    desc: "Lena's annual Friendsgiving! Bring a dish and good vibes. We'll have tables set up for everything.",
    host: 'Lena P.',
    hostId: 'u4',
    mine: false,
    isInvitedTo: true,
    img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80' },
    invH: "Join Us for Friendsgiving! 🍁",
    invBg: '#C67C00',
    guests: [
      { id: 'u1', n: 'Ada Chen',  s: 'pending',  initials: 'AC', color: 'indigo' }, // current user - pending
      { id: 'u2', n: 'Sophie M.', s: 'approved', initials: 'SM', color: 'coral' },
      { id: 'u5', n: 'Marcus W.', s: 'approved', initials: 'MW', color: 'sage' },
      { id: 'u6', n: 'Priya N.',  s: 'approved', initials: 'PN', color: 'amber' },
      { id: 'u7', n: 'James T.',  s: 'pending',  initials: 'JT', color: 'teal' },
    ],
    galleryEnabled: true,
    photoGalleryEnabled: false,
    photoGallery: [],
    potluck: {
      items: [
        // Food
        { id: 'pi1', cat: 'food', emoji: '🦃', name: 'Turkey (main)', claimedBy: 'u4', claimerName: 'Lena P.' },
        { id: 'pi2', cat: 'food', emoji: '🥧', name: 'Pumpkin Pie',   claimedBy: null, claimerName: null },
        { id: 'pi3', cat: 'food', emoji: '🥗', name: 'Green Bean Casserole', claimedBy: 'u2', claimerName: 'Sophie M.' },
        { id: 'pi4', cat: 'food', emoji: '🥔', name: 'Mashed Potatoes', claimedBy: null, claimerName: null },
        { id: 'pi5', cat: 'food', emoji: '🍞', name: 'Cornbread',     claimedBy: 'u5', claimerName: 'Marcus W.' },
        { id: 'pi6', cat: 'food', emoji: '🫙', name: 'Cranberry Sauce', claimedBy: null, claimerName: null },
        // Drinks
        { id: 'pi7', cat: 'drinks', emoji: '🍷', name: 'Wine (2 bottles)', claimedBy: 'u5', claimerName: 'Marcus W.' },
        { id: 'pi8', cat: 'drinks', emoji: '🍺', name: 'Beer / Cider', claimedBy: null, claimerName: null },
        { id: 'pi9', cat: 'drinks', emoji: '🧃', name: 'Non-alcoholic option', claimedBy: 'u6', claimerName: 'Priya N.' },
        // Other
        { id: 'pi10', cat: 'other', emoji: '🕯️', name: 'Candles / Decor', claimedBy: null, claimerName: null },
        { id: 'pi11', cat: 'other', emoji: '🧻', name: 'Paper Napkins', claimedBy: 'u7', claimerName: 'James T.' },
      ],
    },
    supperClub: null,
  },

  // ---- PAST EVENTS (for "My Events" past section) ----
  {
    id: 'evt-past-1',
    title: 'Ramen & Natural Wine Night',
    type: 'Dinner Party',
    date: daysAgo(45),
    time: '19:00',
    isEnded: true,
    isPast: true,
    loc: 'Logan Square, Chicago',
    cap: 8, vis: 'Friends Only',
    desc: 'Tonkotsu ramen paired with orange wines.',
    host: 'Ada Chen', hostId: 'u1', mine: true,
    img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80' },
    guests: [
      { id: 'u2', n: 'Sophie M.', s: 'approved', initials: 'SM', color: 'coral' },
      { id: 'u8', n: 'Yuki S.',   s: 'approved', initials: 'YS', color: 'indigo' },
    ],
    galleryEnabled: true, photoGalleryEnabled: true,
    photoGallery: [
      { id: 'ph-p1', url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&q=80', tags: ['Ramen'], uploadedBy: 'u1', uploaderName: 'Ada Chen' },
    ],
    potluck: null, supperClub: null, invH: '', invBg: '#6C5DD3',
  },
  {
    id: 'evt-past-2',
    title: 'Terroir Vol. II: Loire Valley',
    type: 'Supper Club',
    seriesName: 'Terroir Supper Club',
    seriesVolume: 2,
    date: daysAgo(90),
    time: '19:00',
    isEnded: true,
    isPast: true,
    loc: 'Lincoln Park, Chicago',
    cap: 10, vis: 'Invite Only',
    desc: 'Vol. 2 of the Terroir series. Loire Valley wines and cuisine.',
    host: 'Ada Chen', hostId: 'u1', mine: true,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
    guests: [
      { id: 'u2', n: 'Sophie M.', s: 'approved', initials: 'SM', color: 'coral' },
      { id: 'u5', n: 'Marcus W.', s: 'approved', initials: 'MW', color: 'sage' },
    ],
    galleryEnabled: true, photoGalleryEnabled: true,
    photoGallery: [],
    potluck: null, supperClub: null, invH: '', invBg: '#2D1B4E',
  },
  {
    id: 'evt-past-3',
    title: 'Dumpling Folding Night',
    type: 'Cooking Class',
    date: daysAgo(200),
    time: '15:00',
    isEnded: true,
    isPast: true,
    loc: 'Chinatown, Chicago',
    cap: 12, vis: 'Friends Only',
    desc: 'Xiao long bao and jiaozi. Flour everywhere. Worth it.',
    host: 'Ada Chen', hostId: 'u1', mine: true,
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80' },
    guests: [
      { id: 'u3', n: 'Raj K.', s: 'approved', initials: 'RK', color: 'amber' },
      { id: 'u4', n: 'Lena P.', s: 'approved', initials: 'LP', color: 'teal' },
      { id: 'u8', n: 'Yuki S.', s: 'approved', initials: 'YS', color: 'indigo' },
    ],
    galleryEnabled: true, photoGalleryEnabled: true,
    photoGallery: [],
    potluck: null, supperClub: null, invH: '', invBg: '#6C5DD3',
  },
  {
    id: 'evt-past-4',
    title: 'Terroir Vol. I: Alsace',
    type: 'Supper Club',
    date: daysAgo(380),
    time: '19:00',
    isEnded: true,
    isPast: true,
    loc: 'Lincoln Park, Chicago',
    cap: 8, vis: 'Invite Only',
    desc: 'The dinner that started it all.',
    host: 'Ada Chen', hostId: 'u1', mine: true,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    cover: { type: 'image', value: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
    guests: [
      { id: 'u2', n: 'Sophie M.', s: 'approved', initials: 'SM', color: 'coral' },
    ],
    galleryEnabled: false, photoGalleryEnabled: false, photoGallery: [],
    potluck: null, supperClub: null, invH: '', invBg: '#2D1B4E',
  },
];

// ---- BLOG POSTS ----
export const BLOG_POSTS = [
  {
    id: 'b1',
    category: 'Supper Club Culture',
    title: 'Why the Supper Club is the Most Exciting Format in Food Right Now',
    excerpt: 'From underground loft dinners to ticketed pop-ups, intimate hosting is having a full cultural moment — and Tableaux was built for exactly this.',
    coverImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    author: 'The Tableaux Team',
    authorInitials: 'TX',
    authorColor: 'indigo',
    date: 'March 20, 2026',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 'b2',
    category: 'Host Guide',
    title: '8 Things Every First-Time Dinner Party Host Gets Wrong (and How to Fix Them)',
    excerpt: 'Over-complicated menus, no candles, and the fatal mistake of cooking something you\'ve never made before.',
    coverImg: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    author: 'Sophie M.',
    authorInitials: 'SM',
    authorColor: 'coral',
    date: 'March 17, 2026',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 'b3',
    category: 'Natural Wine',
    title: 'A Beginner\'s Guide to Natural Wine (Without the Snobbery)',
    excerpt: 'Cloudy, funky, alive. Natural wine is confusing until it isn\'t — here\'s where to start and what actually matters.',
    coverImg: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
    author: 'Marcus W.',
    authorInitials: 'MW',
    authorColor: 'sage',
    date: 'March 14, 2026',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 'b4',
    category: 'Recipe',
    title: 'The Only Bœuf Bourguignon Recipe You\'ll Ever Need',
    excerpt: 'Two days of patience, a whole bottle of Burgundy, and the most important dinner you\'ll cook this year.',
    coverImg: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    author: 'Ada Chen',
    authorInitials: 'AC',
    authorColor: 'indigo',
    date: 'March 10, 2026',
    readTime: '9 min read',
    featured: false,
  },
  {
    id: 'b5',
    category: 'Fermentation',
    title: 'How to Build a Fermentation Station in a Studio Apartment',
    excerpt: 'Sourdough starter, kimchi, kombucha, and tepache — all from a 400 sq ft kitchen. Here\'s the setup.',
    coverImg: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    author: 'Lena P.',
    authorInitials: 'LP',
    authorColor: 'teal',
    date: 'March 6, 2026',
    readTime: '8 min read',
    featured: false,
  },
];

// ---- FRIENDS ACTIVITY ----
export const FRIENDS_ACTIVITY = [
  { id: 'a1', userId: 'u2', userName: 'Sophie M.', action: 'is hosting', target: 'An Evening of Provençal Cuisine', targetId: 'evt-pub-1', time: '2h ago', emoji: '🥂' },
  { id: 'a2', userId: 'u5', userName: 'Marcus W.', action: 'just RSVPed to', target: 'Friendsgiving Potluck', targetId: 'evt-potluck-1', time: '4h ago', emoji: '🍂' },
  { id: 'a3', userId: 'u4', userName: 'Lena P.',   action: 'is hosting', target: 'Friendsgiving Potluck 🍂', targetId: 'evt-potluck-1', time: '1d ago', emoji: '🦃' },
  { id: 'a4', userId: 'u8', userName: 'Yuki S.',   action: 'uploaded photos from', target: 'Izakaya Night', targetId: 'evt-ended-1', time: '1d ago', emoji: '📸' },
  { id: 'a5', userId: 'u3', userName: 'Raj K.',    action: 'reviewed', target: 'Girl & the Goat', targetId: null, time: '2d ago', emoji: '⭐' },
  { id: 'a6', userId: 'u6', userName: 'Priya N.',  action: 'claimed Pumpkin Pie at', target: 'Friendsgiving Potluck', targetId: 'evt-potluck-1', time: '3d ago', emoji: '🥧' },
];

// ---- SEED IMAGES (for cover picker) ----
export const SEED_IMAGES = [
  { u: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', l: 'Fine Dining' },
  { u: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', l: 'Spread' },
  { u: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80', l: 'Drinks' },
  { u: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', l: 'Fresh' },
  { u: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80', l: 'Simple' },
  { u: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', l: 'Bowl' },
  { u: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80', l: 'Japanese' },
  { u: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80', l: 'Autumn' },
  { u: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', l: 'Restaurant' },
  { u: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80', l: 'Wine' },
  { u: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', l: 'Fermented' },
  { u: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80', l: 'Grill' },
];

// ---- SEED PLACES (Chicago restaurants) ----
export const SEED_PLACES = [
  { n: 'Alinea',               a: '1723 N Halsted St, Chicago, IL 60614' },
  { n: 'Avec',                  a: '615 W Randolph St, Chicago, IL 60661' },
  { n: 'Gibsons Steakhouse',    a: '1028 N Rush St, Chicago, IL 60611' },
  { n: 'Girl & the Goat',       a: '800 W Randolph St, Chicago, IL 60607' },
  { n: 'Smyth',                 a: '177 N Ada St, Chicago, IL 60607' },
  { n: 'Nobu Chicago',          a: '155 N Wacker Dr, Chicago, IL 60606' },
  { n: 'RPM Italian',           a: '52 W Illinois St, Chicago, IL 60654' },
  { n: 'Au Cheval',             a: '800 W Randolph St, Chicago, IL 60607' },
  { n: 'Monteverde',            a: '1020 W Madison St, Chicago, IL 60607' },
  { n: 'Kimski',                a: '960 W 31st St, Chicago, IL 60608' },
];

// ---- EMOJI CATEGORIES ----
export const EMOJI_CATEGORIES = [
  { label: '🍽️', name: 'Food', emojis: ['🍽️','🥂','🍷','🥃','🍸','🍹','🍾','🫗','🫖','☕','🍵','🧋','🥤','🍻','🥡','🍱','🍣','🍜','🍝','🥘','🫕','🥗','🍲','🫔','🌮','🌯','🥙','🧆','🥚','🍳','🧇','🥞','🧈','🍖','🍗','🥩','🥓','🌭','🍔','🍟','🍕','🥪','🥨','🧀','🥗','🫛','🥦','🥬','🥒','🌽','🥕','🧄','🧅','🥔','🍠','🫚','🫙','🧂','🥫'] },
  { label: '🎉', name: 'Party', emojis: ['🎉','🎊','🪅','✨','🌟','💫','⭐','🎈','🎁','🎀','🎗️','🏮','🕯️','🪔','🎆','🎇','🧨','🪩','🎭','🎨','🎪','🎠','🎡','🎢','🪄','🎸','🎹','🎺','🎻','🥁','🪘','🎵','🎶','🎤','🎧','🎷'] },
  { label: '🌿', name: 'Nature', emojis: ['🌿','🌱','🌾','🍀','🍃','🍂','🍁','🌸','🌺','🌻','🌹','🥀','🌷','💐','🌼','🌞','🌝','🌛','🌜','🌚','⭐','🌙','☀️','⛅','🌤️','🌈','❄️','⛄','🌊','🔥','🌋','🏔️','⛰️','🌄','🌅','🏞️','🌉','🌃'] },
  { label: '😋', name: 'Faces', emojis: ['😋','🤤','😍','🥰','😘','🤩','🥳','😎','🤗','😊','☺️','🙂','😁','😄','😂','🤣','😅','😆','🤭','😇','🥹','🫶','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💞','💓','💗','💖','💝','🫀','💘'] },
  { label: '🏠', name: 'Home', emojis: ['🏠','🏡','🏘️','🏗️','🪑','🛋️','🛏️','🚪','🪟','🧹','🧺','🧻','🪣','🧴','🧷','🪴','🌡️','🧯','🛁','🚿','🪥','🪒','💡','🔦','🕯️','🪞','🗝️','🔑','📦','🎒','👜','👛'] },
];

export const GRADIENT_COVERS = [
  { label: 'Midnight', value: 'linear-gradient(135deg, #1A1A2E, #2D2550)' },
  { label: 'Indigo', value: 'linear-gradient(135deg, #6C5DD3, #8B7CF6)' },
  { label: 'Sunset', value: 'linear-gradient(135deg, #FF6B6B, #FFB347)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #2EC4B6, #87BBA2)' },
  { label: 'Gold', value: 'linear-gradient(135deg, #D4AF37, #E8C84A)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #E91E8C, #FF6B6B)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #0EA5E9, #2EC4B6)' },
  { label: 'Plum', value: 'linear-gradient(135deg, #4A0E8F, #9B59B6)' },
];

export const EMOJI_PRESETS = ['🍽️','🥂','🎉','🍷','✨','🫕','🌿','🍜','🎊','🥘'];
