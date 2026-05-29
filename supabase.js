// ═══════════════════════════════════════════
//  AMR Reality — Supabase Client
//  Shared by shop.html and admin.html
// ═══════════════════════════════════════════

// ⚠️ REPLACE these with your Supabase project credentials
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Product helpers ──────────────────────────

async function getProducts(category) {
  let query = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) { console.error('Error loading products:', error); return []; }
  return data || [];
}

async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('Error loading product:', error); return null; }
  return data;
}

async function getReviews(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) { console.error('Error loading reviews:', error); return []; }
  return data || [];
}

// ── Image URL helper ──────────────────────────
function getImageUrl(path) {
  if (!path) return 'products/placeholder.jpg';
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) return path;
  // If it's a local path, return as-is
  if (path.startsWith('products/')) return path;
  // Otherwise build Supabase storage URL
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data?.publicUrl || 'products/placeholder.jpg';
}
