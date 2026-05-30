// ═══════════════════════════════════════════
//  AMR Reality — Supabase Client
//  Shared by shop.html and admin.html
// ═══════════════════════════════════════════

// ⚠️ REPLACE these with your Supabase project credentials
var SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
var SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

var _supabaseReady = SUPABASE_URL.indexOf('YOUR_PROJECT_ID') === -1;
var supabase = _supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ── Placeholder products (used until Supabase is connected) ──
var PLACEHOLDER_PRODUCTS = [
  {
    id: 'p1', name: 'RBA Jersey Tee', slug: 'rba-jersey-tee', category: 'tees',
    price: 85, badge: 'New', sold_out: false, stock_quantity: 50, sort_order: 1,
    rating: 4.5, review_count: 3, sizes: ['S','M','L','XL','2XL'],
    images: ['products/placeholder.jpg'],
    description: 'Premium streetwear jersey tee from the RBA collection.',
    details: ['100% Premium Cotton','Oversized relaxed fit','Screen-printed graphics','Reinforced stitching','Pre-washed for softness','Designed in Montreal, QC'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days of delivery. Items must be unworn with tags attached.'
  },
  {
    id: 'p2', name: 'Reality Sport Tee', slug: 'reality-sport-tee', category: 'tees',
    price: 90, badge: 'Limited', sold_out: false, stock_quantity: 25, sort_order: 2,
    rating: 4.5, review_count: 0, sizes: ['S','M','L','XL','2XL'],
    images: ['products/placeholder.jpg'],
    description: 'Athletic-cut sport tee with embroidered logo detail.',
    details: ['100% Premium Cotton','Athletic cut','Embroidered logo','Reinforced stitching'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days.'
  },
  {
    id: 'p3', name: 'Heritage Hoodie', slug: 'heritage-hoodie', category: 'hoodies',
    price: 145, badge: null, sold_out: false, stock_quantity: 40, sort_order: 3,
    rating: 5.0, review_count: 2, sizes: ['S','M','L','XL','2XL'],
    images: ['products/placeholder.jpg'],
    description: 'Heavyweight heritage hoodie built for Montreal winters.',
    details: ['80/20 Cotton-Poly blend','Heavyweight 380gsm','Kangaroo pocket','Ribbed cuffs'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days.'
  },
  {
    id: 'p4', name: 'Montreal Bomber', slug: 'montreal-bomber', category: 'outerwear',
    price: 210, badge: 'New', sold_out: false, stock_quantity: 15, sort_order: 4,
    rating: 5.0, review_count: 1, sizes: ['S','M','L','XL'],
    images: ['products/placeholder.jpg'],
    description: 'Quilted bomber jacket designed for Montreal street style.',
    details: ['Nylon shell','Quilted lining','Ribbed collar and cuffs','Zip front closure'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days.'
  },
  {
    id: 'p5', name: 'Utility Cargo Pant', slug: 'utility-cargo-pant', category: 'bottoms',
    price: 120, badge: null, sold_out: false, stock_quantity: 30, sort_order: 5,
    rating: 4.0, review_count: 1, sizes: ['S','M','L','XL','2XL'],
    images: ['products/placeholder.jpg'],
    description: 'Relaxed-fit utility cargo pants with six-pocket design.',
    details: ['100% Cotton twill','Relaxed fit','Six pocket design','Adjustable waist'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days.'
  },
  {
    id: 'p6', name: 'Washed Reality Hoodie', slug: 'washed-reality-hoodie', category: 'hoodies',
    price: 135, badge: 'Limited', sold_out: false, stock_quantity: 20, sort_order: 6,
    rating: 4.5, review_count: 0, sizes: ['S','M','L','XL','2XL'],
    images: ['products/placeholder.jpg'],
    description: 'Acid wash finish heavyweight hoodie with drop shoulder.',
    details: ['100% Cotton','Acid wash finish','Heavyweight 400gsm','Drop shoulder'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days.'
  },
  {
    id: 'p7', name: 'AMR Oversized Tee', slug: 'amr-oversized-tee', category: 'tees',
    price: 80, badge: 'New', sold_out: false, stock_quantity: 60, sort_order: 7,
    rating: 4.5, review_count: 0, sizes: ['S','M','L','XL','2XL'],
    images: ['products/placeholder.jpg'],
    description: 'Boxy oversized tee with back print graphic.',
    details: ['100% Premium Cotton','Oversized fit','Back print graphic','Boxy silhouette'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days.'
  },
  {
    id: 'p8', name: 'Raw Denim Pant', slug: 'raw-denim-pant', category: 'bottoms',
    price: 130, badge: null, sold_out: false, stock_quantity: 18, sort_order: 8,
    rating: 4.5, review_count: 0, sizes: ['28','30','32','34','36'],
    images: ['products/placeholder.jpg'],
    description: 'Japanese selvedge raw denim with chain stitch hemming.',
    details: ['14oz raw selvedge denim','Straight leg','Chain stitch hemming','Japanese fabric'],
    delivery_info: 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days.'
  }
];

var PLACEHOLDER_REVIEWS = {
  'p1': [
    { id: 'r1', product_id: 'p1', author: 'Marcus T.', rating: 5, text: 'Best quality tee I\'ve ever owned. The fit is perfect.' },
    { id: 'r2', product_id: 'p1', author: 'Priya K.', rating: 5, text: 'Looks even better in person. Heavyweight fabric, clean printing.' },
    { id: 'r3', product_id: 'p1', author: 'Jordan L.', rating: 4, text: 'Love the design. Runs slightly large — size down if between sizes.' }
  ],
  'p3': [
    { id: 'r4', product_id: 'p3', author: 'Anika R.', rating: 5, text: 'Heaviest hoodie I own. Worth every penny.' },
    { id: 'r5', product_id: 'p3', author: 'Devon M.', rating: 5, text: 'The quality is insane for the price. Feels like a $300 hoodie.' }
  ],
  'p4': [
    { id: 'r6', product_id: 'p4', author: 'Tyler S.', rating: 5, text: 'This bomber is everything. Perfect for Montreal weather.' }
  ],
  'p5': [
    { id: 'r7', product_id: 'p5', author: 'Sam W.', rating: 4, text: 'Great fit, lots of pockets. The fabric softens up nicely after a few washes.' }
  ]
};

// ── Product helpers ──────────────────────────

async function getProducts(category) {
  if (!_supabaseReady) {
    var products = PLACEHOLDER_PRODUCTS.slice();
    if (category && category !== 'all') {
      products = products.filter(function(p) { return p.category === category; });
    }
    return products;
  }

  var query = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  var result = await query;
  if (result.error) { console.error('Error loading products:', result.error); return PLACEHOLDER_PRODUCTS.slice(); }
  return result.data && result.data.length > 0 ? result.data : PLACEHOLDER_PRODUCTS.slice();
}

async function getProduct(id) {
  if (!_supabaseReady) {
    return PLACEHOLDER_PRODUCTS.find(function(p) { return p.id === id; }) || null;
  }

  var result = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (result.error) { console.error('Error loading product:', result.error); return null; }
  return result.data;
}

async function getReviews(productId) {
  if (!_supabaseReady) {
    return PLACEHOLDER_REVIEWS[productId] || [];
  }

  var result = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (result.error) { console.error('Error loading reviews:', result.error); return []; }
  return result.data || [];
}

// ── Image URL helper ──────────────────────────
function getImageUrl(path) {
  if (!path) return 'products/placeholder.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('products/')) return path;
  if (!_supabaseReady) return 'products/placeholder.jpg';
  var result = supabase.storage.from('product-images').getPublicUrl(path);
  return (result.data && result.data.publicUrl) || 'products/placeholder.jpg';
}
