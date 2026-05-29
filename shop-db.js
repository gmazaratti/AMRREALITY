// ═══════════════════════════════════════════
//  AMR Reality — Database-Driven Shop
//  Replaces hardcoded product cards with
//  products loaded from Supabase
// ═══════════════════════════════════════════

(function () {
  'use strict';

  var grid = document.getElementById('shop-grid');
  var overlay = document.getElementById('product-overlay');
  var overlayImg = document.getElementById('overlay-img');
  var overlayName = document.getElementById('overlay-name');
  var overlayPrice = document.getElementById('overlay-price');
  var overlayCat = document.getElementById('overlay-category');
  var overlayThumbs = document.getElementById('overlay-thumbs');
  var closeBtn = document.getElementById('overlay-close');
  var qtyValue = document.getElementById('qty-value');
  var addCartBtn = document.getElementById('add-to-cart-btn');

  var currentQty = 1;
  var currentProduct = null;

  var catLabels = { tees: 'Tees', hoodies: 'Hoodies', outerwear: 'Outerwear', bottoms: 'Bottoms' };

  // ═══════════════════════════════
  //  CART (localStorage)
  // ═══════════════════════════════
  var cart = JSON.parse(localStorage.getItem('amr_cart') || '[]');

  function saveCart() {
    localStorage.setItem('amr_cart', JSON.stringify(cart));
    updateCartBadges();
    renderCartDrawer();
  }

  function getCartCount() {
    return cart.reduce(function (s, i) { return s + i.qty; }, 0);
  }

  function getCartTotal() {
    return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  function updateCartBadges() {
    var count = getCartCount();
    document.querySelectorAll('.cart-badge').forEach(function (b) {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function addToCart(name, price, size, qty, imgSrc) {
    var existing = cart.find(function (i) { return i.name === name && i.size === size; });
    if (existing) { existing.qty += qty; } else {
      cart.push({ name: name, price: price, size: size, qty: qty, img: imgSrc });
    }
    saveCart();
  }

  function removeFromCart(idx) { cart.splice(idx, 1); saveCart(); }

  function changeCartQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
  }

  // Cart drawer
  var cartDrawer = document.getElementById('cart-drawer');
  var cartBackdrop = document.getElementById('cart-backdrop');
  var cartItemsEl = document.getElementById('cart-items');
  var cartTotalEl = document.getElementById('cart-total');
  var cartFooter = document.getElementById('cart-footer');

  function openCartDrawer() {
    if (cartDrawer) { cartDrawer.classList.add('open'); cartBackdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function closeCartDrawer() {
    if (cartDrawer) { cartDrawer.classList.remove('open'); cartBackdrop.classList.remove('open'); }
    if (!overlay.classList.contains('active')) document.body.style.overflow = '';
  }

  if (document.getElementById('cart-close')) {
    document.getElementById('cart-close').addEventListener('click', closeCartDrawer);
  }
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

  document.querySelectorAll('[data-open-cart]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openCartDrawer(); });
  });

  function renderCartDrawer() {
    if (!cartItemsEl) return;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-drawer__empty">Your cart is empty</p>';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }
    if (cartFooter) cartFooter.style.display = '';
    var html = '';
    cart.forEach(function (item, i) {
      html += '<div class="cart-item">' +
        '<img src="' + item.img + '" alt="' + item.name + '" class="cart-item__img" />' +
        '<div class="cart-item__info">' +
          '<p class="cart-item__name">' + item.name + '</p>' +
          '<p class="cart-item__meta">Size: ' + item.size + '</p>' +
          '<p class="cart-item__price">$' + item.price + '</p>' +
        '</div>' +
        '<div class="cart-item__controls">' +
          '<div class="cart-item__qty">' +
            '<button class="cart-item__qty-btn" data-action="minus" data-index="' + i + '">&minus;</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="cart-item__qty-btn" data-action="plus" data-index="' + i + '">+</button>' +
          '</div>' +
          '<button class="cart-item__remove" data-index="' + i + '">Remove</button>' +
        '</div>' +
      '</div>';
    });
    cartItemsEl.innerHTML = html;
    cartTotalEl.textContent = '$' + getCartTotal();

    cartItemsEl.querySelectorAll('.cart-item__qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        changeCartQty(parseInt(btn.getAttribute('data-index')), btn.getAttribute('data-action') === 'plus' ? 1 : -1);
      });
    });
    cartItemsEl.querySelectorAll('.cart-item__remove').forEach(function (btn) {
      btn.addEventListener('click', function () { removeFromCart(parseInt(btn.getAttribute('data-index'))); });
    });
  }

  updateCartBadges();
  renderCartDrawer();

  // ═══════════════════════════════
  //  LOAD PRODUCTS FROM DB
  // ═══════════════════════════════
  async function loadShopProducts() {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;"><div class="loading-spinner" style="display:inline-block;width:24px;height:24px;border:2px solid rgba(232,228,222,0.08);border-top-color:#c9a96e;border-radius:50%;animation:spin 0.8s linear infinite;"></div><p style="margin-top:1rem;font-size:0.7rem;color:#8a8680;letter-spacing:0.1em;">Loading products...</p><style>@keyframes spin{to{transform:rotate(360deg)}}</style></div>';

    var products = await getProducts();

    if (products.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;"><p style="font-size:0.8rem;color:#8a8680;letter-spacing:0.1em;">No products available</p></div>';
      return;
    }

    renderProductGrid(products);
    setupFilterButtons(products);
  }

  function renderProductGrid(products) {
    grid.innerHTML = products.map(function (p) {
      var imgSrc = p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : 'products/placeholder.jpg';
      var badgeHtml = '';
      if (p.sold_out) {
        badgeHtml = '<span class="product-card__badge" style="background:var(--red)">Sold Out</span>';
      } else if (p.badge) {
        badgeHtml = '<span class="product-card__badge">' + p.badge + '</span>';
      }

      return '<article class="product-card" data-category="' + p.category + '" data-id="' + p.id + '">' +
        '<div class="product-card__img">' +
          '<img src="' + imgSrc + '" alt="' + escHtml(p.name) + '" loading="lazy" />' +
          badgeHtml +
        '</div>' +
        '<div class="product-card__info">' +
          '<h3 class="product-card__name">' + escHtml(p.name) + '</h3>' +
          '<p class="product-card__price">$' + p.price + '</p>' +
        '</div>' +
      '</article>';
    }).join('');

    // Bind click to open overlay
    grid.querySelectorAll('.product-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        var product = products.find(function (p) { return p.id === id; });
        if (product) openProductOverlay(product);
      });
    });
  }

  function setupFilterButtons(allProducts) {
    var btns = document.querySelectorAll('.shop-filter__btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        var filtered = filter === 'all' ? allProducts : allProducts.filter(function (p) { return p.category === filter; });
        renderProductGrid(filtered);
      });
    });
  }

  // ═══════════════════════════════
  //  PRODUCT OVERLAY
  // ═══════════════════════════════
  async function openProductOverlay(product) {
    currentProduct = product;

    var imgSrc = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : 'products/placeholder.jpg';
    overlayImg.src = imgSrc;
    overlayImg.alt = product.name;
    overlayName.textContent = product.name;
    overlayPrice.textContent = '$' + product.price;
    overlayCat.textContent = catLabels[product.category] || product.category;

    // Thumbnails
    overlayThumbs.innerHTML = '';
    var images = product.images && product.images.length > 0 ? product.images : ['products/placeholder.jpg'];
    // Pad to at least 3 thumbnails
    while (images.length < 3) images.push(images[0]);

    images.forEach(function (imgPath, idx) {
      var url = getImageUrl(imgPath);
      var thumb = document.createElement('div');
      thumb.className = 'product-overlay__thumb' + (idx === 0 ? ' active' : '');
      var tImg = document.createElement('img');
      tImg.src = url;
      tImg.alt = 'View ' + (idx + 1);
      thumb.appendChild(tImg);
      thumb.addEventListener('click', function () {
        overlayThumbs.querySelectorAll('.product-overlay__thumb').forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
        overlayImg.src = url;
      });
      overlayThumbs.appendChild(thumb);
    });

    // Star rating
    var starsContainer = document.querySelector('.product-overlay__stars');
    if (starsContainer) {
      var rating = product.rating || 4.5;
      var svgs = starsContainer.querySelectorAll('svg');
      svgs.forEach(function (svg, i) {
        svg.classList.remove('star-half');
        if (i >= Math.ceil(rating)) svg.classList.add('star-half');
        else if (i === Math.floor(rating) && rating % 1 !== 0) svg.classList.add('star-half');
      });
    }

    var reviewCountEl = document.querySelector('.product-overlay__review-count');
    if (reviewCountEl) reviewCountEl.textContent = '(' + (product.review_count || 0) + ')';

    // Sizes
    var sizesGrid = document.querySelector('.product-overlay__sizes-grid');
    if (sizesGrid) {
      var sizes = product.sizes || ['S', 'M', 'L', 'XL', '2XL'];
      sizesGrid.innerHTML = sizes.map(function (s, i) {
        return '<button class="product-overlay__size-btn' + (i === 1 ? ' selected' : '') + '" data-size="' + s + '">' + s + '</button>';
      }).join('');

      sizesGrid.querySelectorAll('.product-overlay__size-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          sizesGrid.querySelectorAll('.product-overlay__size-btn').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
        });
      });
    }

    // Details accordion
    var detailsContent = document.querySelector('.po-accordion:nth-child(1) .po-accordion__content');
    if (detailsContent && product.details && product.details.length > 0) {
      detailsContent.innerHTML = '<ul>' + product.details.map(function (d) { return '<li>' + escHtml(d) + '</li>'; }).join('') + '</ul>' +
        '<p>Product ID: AMR-' + product.slug.toUpperCase().substring(0, 8) + '</p>';
    }

    // Delivery accordion
    var deliveryContent = document.querySelector('.po-accordion:nth-child(2) .po-accordion__content');
    if (deliveryContent && product.delivery_info) {
      deliveryContent.innerHTML = product.delivery_info.split('. ').map(function (s) {
        return '<p>' + escHtml(s.trim()) + (s.trim().endsWith('.') ? '' : '.') + '</p>';
      }).join('');
    }

    // Reviews accordion
    var reviewsContent = document.querySelector('.po-accordion:nth-child(3) .po-accordion__content');
    if (reviewsContent) {
      var reviews = await getReviews(product.id);
      if (reviews.length > 0) {
        reviewsContent.innerHTML = reviews.map(function (r) {
          var stars = '';
          for (var s = 0; s < 5; s++) stars += s < r.rating ? '★' : '☆';
          return '<div class="po-review">' +
            '<div class="po-review__stars">' + stars + '</div>' +
            '<p class="po-review__text">"' + escHtml(r.text) + '"</p>' +
            '<p class="po-review__author">— ' + escHtml(r.author) + '</p>' +
          '</div>';
        }).join('');
      } else {
        reviewsContent.innerHTML = '<p>No reviews yet</p>';
      }
    }

    // Description
    var descEl = document.querySelector('.product-overlay__desc');
    if (descEl) {
      if (product.description) {
        descEl.innerHTML = '<p>' + escHtml(product.description) + '</p>';
      }
    }

    // Reset qty
    currentQty = 1;
    qtyValue.textContent = '1';

    // Close all accordions
    document.querySelectorAll('.po-accordion').forEach(function (a) { a.classList.remove('open'); });

    // Animate
    overlayImg.style.animation = 'none';
    void overlayImg.offsetHeight;
    overlayImg.style.animation = '';

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close overlay
  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeOverlay();
  });

  // Quantity
  document.getElementById('qty-minus').addEventListener('click', function () {
    if (currentQty > 1) { currentQty--; qtyValue.textContent = currentQty; }
  });
  document.getElementById('qty-plus').addEventListener('click', function () {
    currentQty++;
    qtyValue.textContent = currentQty;
  });

  // Add to cart
  addCartBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    var selectedSize = document.querySelector('.product-overlay__size-btn.selected');
    var size = selectedSize ? selectedSize.getAttribute('data-size') : 'M';
    var imgSrc = overlayImg.src;

    addToCart(currentProduct.name, currentProduct.price, size, currentQty, imgSrc);

    addCartBtn.textContent = 'Added ✓';
    addCartBtn.style.background = 'var(--gold)';
    addCartBtn.style.color = 'var(--bg)';
    setTimeout(function () {
      addCartBtn.textContent = 'Add to Cart';
      addCartBtn.style.background = '';
      addCartBtn.style.color = '';
    }, 1200);
  });

  // Accordion toggles
  document.querySelectorAll('.po-accordion__toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      toggle.parentElement.classList.toggle('open');
    });
  });

  // ═══════════════════════════════
  //  UTILS
  // ═══════════════════════════════
  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // ═══════════════════════════════
  //  INIT
  // ═══════════════════════════════
  loadShopProducts();

})();
