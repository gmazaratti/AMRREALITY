// ═══════════════════════════════════════════
//  AMR Reality — Admin Panel Logic
// ═══════════════════════════════════════════

(function () {
  'use strict';

  // ── DOM refs ──
  const loginScreen = document.getElementById('login-screen');
  const adminApp = document.getElementById('admin-app');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userEmail = document.getElementById('admin-user-email');

  const productTbody = document.getElementById('product-tbody');
  const productSearch = document.getElementById('product-search');
  const emptyState = document.getElementById('empty-state');
  const productTable = document.getElementById('product-table');

  const modalBackdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('cancel-product-btn');
  const saveBtn = document.getElementById('save-product-btn');
  const deleteBtn = document.getElementById('delete-product-btn');
  const saveSpinner = document.getElementById('save-spinner');

  // Stats
  const statTotal = document.getElementById('stat-total');
  const statActive = document.getElementById('stat-active');
  const statSoldout = document.getElementById('stat-soldout');
  const statCategories = document.getElementById('stat-categories');

  // Form fields
  const fName = document.getElementById('p-name');
  const fSlug = document.getElementById('p-slug');
  const fCategory = document.getElementById('p-category');
  const fPrice = document.getElementById('p-price');
  const fStock = document.getElementById('p-stock');
  const fSort = document.getElementById('p-sort');
  const fSoldout = document.getElementById('p-soldout');
  const fDescription = document.getElementById('p-description');
  const fDelivery = document.getElementById('p-delivery');
  const fRating = document.getElementById('p-rating');
  const fReviewCount = document.getElementById('p-review-count');

  let allProducts = [];
  let editingProductId = null;
  let currentImages = [];
  let currentDetails = [];
  let currentReviews = [];

  // ═══════════════════════════════
  //  TOAST SYSTEM
  // ═══════════════════════════════
  function toast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast toast--' + type;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () {
      el.classList.add('removing');
      setTimeout(function () { el.remove(); }, 300);
    }, 3000);
  }

  // ═══════════════════════════════
  //  AUTH (hardcoded credentials)
  // ═══════════════════════════════
  var ADMIN_USER = 'AMRREALITY';
  var ADMIN_PASS = 'MerchSale99!';

  function checkSession() {
    if (sessionStorage.getItem('amr_admin_auth') === 'true') {
      showApp();
    }
  }

  function showApp() {
    loginScreen.style.display = 'none';
    adminApp.classList.add('visible');
    userEmail.textContent = ADMIN_USER;
    sessionStorage.setItem('amr_admin_auth', 'true');
    loadProducts();
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    var username = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      showApp();
    } else {
      loginError.textContent = 'Invalid username or password';
    }

    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  });

  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem('amr_admin_auth');
    loginScreen.style.display = '';
    adminApp.classList.remove('visible');
    toast('Logged out', 'info');
  });

  // ═══════════════════════════════
  //  LOAD PRODUCTS
  // ═══════════════════════════════
  async function loadProducts() {
    const products = await getProducts();
    allProducts = products;
    renderTable(products);
    updateStats(products);
  }

  function updateStats(products) {
    statTotal.textContent = products.length;
    statActive.textContent = products.filter(function (p) { return !p.sold_out; }).length;
    statSoldout.textContent = products.filter(function (p) { return p.sold_out; }).length;
    var cats = {};
    products.forEach(function (p) { cats[p.category] = true; });
    statCategories.textContent = Object.keys(cats).length;
  }

  // ═══════════════════════════════
  //  RENDER TABLE
  // ═══════════════════════════════
  function renderTable(products) {
    if (products.length === 0) {
      productTable.style.display = 'none';
      emptyState.style.display = '';
      return;
    }
    productTable.style.display = '';
    emptyState.style.display = 'none';

    productTbody.innerHTML = products.map(function (p) {
      var imgSrc = p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : 'products/placeholder.jpg';
      var badgeClass = p.badge ? 'product-table__badge--' + p.badge.toLowerCase() : '';
      var statusClass = p.sold_out ? 'product-table__status--soldout' : 'product-table__status--active';
      var statusText = p.sold_out ? 'Sold Out' : 'Active';

      return '<tr data-id="' + p.id + '">' +
        '<td><img class="product-table__img" src="' + imgSrc + '" alt="" /></td>' +
        '<td><span class="product-table__name">' + escHtml(p.name) + '</span></td>' +
        '<td><span class="product-table__category">' + p.category + '</span></td>' +
        '<td><span class="product-table__price">$' + p.price + '</span></td>' +
        '<td><span class="product-table__stock">' + (p.stock_quantity || 0) + '</span></td>' +
        '<td><span class="product-table__status ' + statusClass + '"><span class="product-table__status-dot"></span>' + statusText + '</span></td>' +
        '<td>' + (p.badge ? '<span class="product-table__badge ' + badgeClass + '">' + p.badge + '</span>' : '—') + '</td>' +
        '<td class="product-table__actions">' +
          '<button class="btn btn--outline btn--small edit-btn" data-id="' + p.id + '">Edit</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    // Bind edit buttons
    productTbody.querySelectorAll('.edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openEditor(btn.getAttribute('data-id'));
      });
    });
  }

  // ── Search ──
  productSearch.addEventListener('input', function () {
    var q = productSearch.value.toLowerCase();
    var filtered = allProducts.filter(function (p) {
      return p.name.toLowerCase().includes(q) || p.category.includes(q);
    });
    renderTable(filtered);
  });

  // ═══════════════════════════════
  //  MODAL CONTROLS
  // ═══════════════════════════════
  function openModal() {
    modal.classList.add('open');
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    editingProductId = null;
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Add product buttons
  document.getElementById('add-product-btn').addEventListener('click', function () { openEditor(null); });
  document.getElementById('add-product-btn-empty').addEventListener('click', function () { openEditor(null); });

  // ═══════════════════════════════
  //  EDITOR
  // ═══════════════════════════════
  async function openEditor(productId) {
    editingProductId = productId;

    if (productId) {
      modalTitle.textContent = 'Edit Product';
      deleteBtn.style.display = '';

      var product = allProducts.find(function (p) { return p.id === productId; });
      if (!product) return;

      fName.value = product.name;
      fSlug.value = product.slug;
      fCategory.value = product.category;
      fPrice.value = product.price;
      fStock.value = product.stock_quantity || 0;
      fSort.value = product.sort_order || 0;
      fSoldout.checked = product.sold_out;
      fDescription.value = product.description || '';
      fDelivery.value = product.delivery_info || '';
      fRating.value = product.rating || 4.5;
      fReviewCount.value = product.review_count || 0;

      // Badge
      var badgeVal = product.badge || '';
      document.querySelectorAll('input[name="p-badge"]').forEach(function (r) {
        r.checked = r.value === badgeVal;
      });

      // Sizes
      var sizes = product.sizes || [];
      document.querySelectorAll('#p-sizes input').forEach(function (cb) {
        cb.checked = sizes.includes(cb.value);
      });

      // Images
      currentImages = (product.images || []).slice();
      renderImagePreviews();

      // Details
      currentDetails = (product.details || []).slice();
      renderDetails();

      // Reviews
      var reviews = await getReviews(productId);
      currentReviews = reviews;
      renderReviewsList();

    } else {
      modalTitle.textContent = 'Add Product';
      deleteBtn.style.display = 'none';
      resetForm();
    }

    openModal();
  }

  function resetForm() {
    fName.value = '';
    fSlug.value = '';
    fCategory.value = 'tees';
    fPrice.value = '';
    fStock.value = '0';
    fSort.value = '0';
    fSoldout.checked = false;
    fDescription.value = '';
    fDelivery.value = 'Free shipping on orders over $120 CAD. Standard delivery: 5–8 business days. Express delivery: 2–3 business days ($15 CAD). Hassle-free returns within 14 days of delivery. Items must be unworn with tags attached.';
    fRating.value = '4.5';
    fReviewCount.value = '0';

    document.querySelectorAll('input[name="p-badge"]').forEach(function (r) {
      r.checked = r.value === '';
    });

    document.querySelectorAll('#p-sizes input').forEach(function (cb) {
      cb.checked = ['S', 'M', 'L', 'XL', '2XL'].includes(cb.value);
    });

    currentImages = [];
    currentDetails = ['100% Premium Cotton', 'Oversized relaxed fit', 'Designed in Montreal, QC'];
    currentReviews = [];
    renderImagePreviews();
    renderDetails();
    renderReviewsList();
  }

  // Auto-slug from name
  fName.addEventListener('input', function () {
    if (!editingProductId) {
      fSlug.value = slugify(fName.value);
    }
  });

  function slugify(text) {
    return text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }

  // ── Details ──
  function renderDetails() {
    var list = document.getElementById('p-details');
    list.innerHTML = currentDetails.map(function (d, i) {
      return '<div class="detail-item">' +
        '<input class="form-input" type="text" value="' + escAttr(d) + '" data-idx="' + i + '" />' +
        '<button class="detail-item__remove" data-idx="' + i + '">&times;</button>' +
      '</div>';
    }).join('');

    list.querySelectorAll('.form-input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        currentDetails[parseInt(inp.getAttribute('data-idx'))] = inp.value;
      });
    });

    list.querySelectorAll('.detail-item__remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentDetails.splice(parseInt(btn.getAttribute('data-idx')), 1);
        renderDetails();
      });
    });
  }

  document.getElementById('add-detail-btn').addEventListener('click', function () {
    currentDetails.push('');
    renderDetails();
    // Focus the new input
    var inputs = document.querySelectorAll('#p-details .form-input');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  });

  // ── Images ──
  function renderImagePreviews() {
    var grid = document.getElementById('image-preview-grid');
    grid.innerHTML = currentImages.map(function (url, i) {
      var displayUrl = getImageUrl(url);
      return '<div class="image-preview">' +
        '<img src="' + displayUrl + '" alt="" />' +
        '<button class="image-preview__remove" data-idx="' + i + '">&times;</button>' +
      '</div>';
    }).join('');

    grid.querySelectorAll('.image-preview__remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentImages.splice(parseInt(btn.getAttribute('data-idx')), 1);
        renderImagePreviews();
      });
    });
  }

  // Image upload zone
  var uploadZone = document.getElementById('image-upload-zone');
  var fileInput = document.getElementById('image-file-input');

  uploadZone.addEventListener('click', function () { fileInput.click(); });
  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--gold)';
    uploadZone.style.background = 'var(--gold-dim)';
  });
  uploadZone.addEventListener('dragleave', function () {
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });
  uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', function () {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  async function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast('File too large: ' + file.name, 'error');
        continue;
      }

      var ext = file.name.split('.').pop();
      var fileName = Date.now() + '-' + Math.random().toString(36).substring(7) + '.' + ext;

      toast('Uploading ' + file.name + '...', 'info');

      var { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { contentType: file.type });

      if (error) {
        toast('Upload failed: ' + error.message, 'error');
        continue;
      }

      currentImages.push(data.path);
      renderImagePreviews();
      toast('Uploaded ' + file.name, 'success');
    }
  }

  // ── Reviews ──
  function renderReviewsList() {
    var list = document.getElementById('p-reviews');
    if (currentReviews.length === 0) {
      list.innerHTML = '<p style="font-size:0.65rem; color:var(--text-muted)">No reviews yet</p>';
      return;
    }

    list.innerHTML = currentReviews.map(function (r, i) {
      var stars = '';
      for (var s = 0; s < 5; s++) stars += s < r.rating ? '★' : '☆';
      return '<div class="review-item">' +
        '<div class="review-item__content">' +
          '<div class="review-item__stars">' + stars + '</div>' +
          '<p class="review-item__text">"' + escHtml(r.text) + '"</p>' +
          '<p class="review-item__author">— ' + escHtml(r.author) + '</p>' +
        '</div>' +
        '<button class="btn btn--danger btn--small" data-review-idx="' + i + '">Delete</button>' +
      '</div>';
    }).join('');

    list.querySelectorAll('[data-review-idx]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var idx = parseInt(btn.getAttribute('data-review-idx'));
        var review = currentReviews[idx];
        if (review.id) {
          await supabase.from('reviews').delete().eq('id', review.id);
        }
        currentReviews.splice(idx, 1);
        renderReviewsList();
        toast('Review deleted', 'success');
      });
    });
  }

  document.getElementById('add-review-btn').addEventListener('click', function () {
    var author = prompt('Reviewer name:');
    if (!author) return;
    var rating = parseInt(prompt('Rating (1-5):'));
    if (isNaN(rating) || rating < 1 || rating > 5) { toast('Invalid rating', 'error'); return; }
    var text = prompt('Review text:');
    if (!text) return;

    currentReviews.push({ author: author, rating: rating, text: text, _new: true });
    renderReviewsList();
  });

  // ═══════════════════════════════
  //  SAVE PRODUCT
  // ═══════════════════════════════
  saveBtn.addEventListener('click', async function () {
    var name = fName.value.trim();
    if (!name) { toast('Product name is required', 'error'); return; }

    var slug = fSlug.value.trim() || slugify(name);
    var badge = document.querySelector('input[name="p-badge"]:checked').value || null;
    var sizes = [];
    document.querySelectorAll('#p-sizes input:checked').forEach(function (cb) {
      sizes.push(cb.value);
    });

    var productData = {
      name: name,
      slug: slug,
      category: fCategory.value,
      price: parseInt(fPrice.value) || 0,
      stock_quantity: parseInt(fStock.value) || 0,
      sort_order: parseInt(fSort.value) || 0,
      sold_out: fSoldout.checked,
      badge: badge,
      sizes: sizes,
      description: fDescription.value,
      details: currentDetails.filter(function (d) { return d.trim() !== ''; }),
      delivery_info: fDelivery.value,
      rating: parseFloat(fRating.value) || 4.5,
      images: currentImages,
    };

    saveSpinner.style.display = '';
    saveBtn.disabled = true;

    var error;
    var productId = editingProductId;

    if (editingProductId) {
      // Update
      var result = await supabase.from('products').update(productData).eq('id', editingProductId);
      error = result.error;
    } else {
      // Insert
      var result = await supabase.from('products').insert(productData).select().single();
      error = result.error;
      if (result.data) productId = result.data.id;
    }

    if (error) {
      toast('Error saving: ' + error.message, 'error');
      saveSpinner.style.display = 'none';
      saveBtn.disabled = false;
      return;
    }

    // Save new reviews
    if (productId) {
      var newReviews = currentReviews.filter(function (r) { return r._new; });
      for (var i = 0; i < newReviews.length; i++) {
        await supabase.from('reviews').insert({
          product_id: productId,
          author: newReviews[i].author,
          rating: newReviews[i].rating,
          text: newReviews[i].text,
        });
      }

      // Update review count
      var { count } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('product_id', productId);
      await supabase.from('products').update({ review_count: count || 0 }).eq('id', productId);
    }

    saveSpinner.style.display = 'none';
    saveBtn.disabled = false;
    toast(editingProductId ? 'Product updated' : 'Product created', 'success');
    closeModal();
    loadProducts();
  });

  // ═══════════════════════════════
  //  DELETE PRODUCT
  // ═══════════════════════════════
  deleteBtn.addEventListener('click', async function () {
    if (!editingProductId) return;
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;

    var { error } = await supabase.from('products').delete().eq('id', editingProductId);
    if (error) {
      toast('Error deleting: ' + error.message, 'error');
      return;
    }

    toast('Product deleted', 'success');
    closeModal();
    loadProducts();
  });

  // ═══════════════════════════════
  //  UTILS
  // ═══════════════════════════════
  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function escAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ═══════════════════════════════
  //  INIT
  // ═══════════════════════════════
  checkSession();

})();
