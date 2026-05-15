const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const CART_KEY = "click_imports_cart";
let selectedCategory = "Todas";

function money(value) {
  return formatter.format(value);
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function cartItemKey(item) {
  return `${item.productId}-${item.variantName}`;
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(cartItem => cartItemKey(cartItem) === cartItemKey(item));

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
  openCart();
}

function removeFromCart(key) {
  const cart = getCart().filter(item => cartItemKey(item) !== key);
  saveCart(cart);
}

function changeCartQty(key, amount) {
  const cart = getCart();
  const item = cart.find(cartItem => cartItemKey(cartItem) === key);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    saveCart(cart.filter(cartItem => cartItemKey(cartItem) !== key));
  } else {
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((total, item) => total + item.price * item.quantity, 0);
}

function buildWhatsappCartMessage() {
  const cart = getCart();

  if (cart.length === 0) {
    return encodeURIComponent(`Hola, vengo del catálogo de ${BUSINESS_NAME}. Quiero recibir información.`);
  }

  let message = `Hola, quiero hacer este pedido desde el catálogo de ${BUSINESS_NAME}:%0A%0A`;

  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name}%0A`;
    message += `   Opción: ${item.variantName}%0A`;
    message += `   Color: ${item.color}%0A`;
    message += `   Talla/Medida: ${item.size}%0A`;
    message += `   Cantidad: ${item.quantity}%0A`;
    message += `   Precio unitario: ${money(item.price)}%0A`;
    message += `   Subtotal: ${money(item.price * item.quantity)}%0A%0A`;
  });

  message += `TOTAL APROXIMADO: ${money(getCartTotal())}%0A%0A`;
  message += `Quedo atento a disponibilidad y forma de entrega.`;

  return message;
}

function updateCartUI() {
  const cart = getCart();
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const sendWhatsappCart = document.getElementById("sendWhatsappCart");
  const floatingWhatsapp = document.getElementById("floatingWhatsapp");

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  if (cartCount) cartCount.textContent = totalItems;
  if (cartTotal) cartTotal.textContent = money(getCartTotal());

  if (sendWhatsappCart) {
    sendWhatsappCart.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsappCartMessage()}`;
  }

  if (floatingWhatsapp) {
    const msg = encodeURIComponent(`Hola, vengo del catálogo de ${BUSINESS_NAME}. Quiero recibir información.`);
    floatingWhatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <strong>Tu carrito está vacío</strong>
        <p>Agrega productos para enviar el pedido completo por WhatsApp.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const key = cartItemKey(item);
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.variantName}</p>
          <strong>${money(item.price)}</strong>

          <div class="cart-qty">
            <button onclick="changeCartQty('${key}', -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeCartQty('${key}', 1)">+</button>
            <button class="remove" onclick="removeFromCart('${key}')">Eliminar</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("show");
}

function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("show");
}

function setupCartControls() {
  document.getElementById("openCartBtn")?.addEventListener("click", openCart);
  document.getElementById("heroCartBtn")?.addEventListener("click", openCart);
  document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("clearCartBtn")?.addEventListener("click", () => saveCart([]));
}

function minPrice(product) {
  return Math.min(...product.variants.map(v => v.price));
}

function renderCategories() {
  const categoryButtons = document.getElementById("categoryButtons");
  if (!categoryButtons) return;

  const categories = ["Todas", ...new Set(products.map(product => product.category))];

  categoryButtons.innerHTML = categories.map(category => `
    <button class="category-btn ${category === selectedCategory ? "active" : ""}" data-category="${category}">
      ${category}
    </button>
  `).join("");

  document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function renderProducts() {
  const productGrid = document.getElementById("productGrid");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  if (!productGrid) return;

  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const sort = sortSelect ? sortSelect.value : "default";

  let filtered = products.filter(product => {
    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.shortDescription.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  if (sort === "price-low") filtered.sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "price-high") filtered.sort((a, b) => minPrice(b) - minPrice(a));
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  if (filtered.length === 0) {
    productGrid.innerHTML = `<div class="empty">No se encontraron productos.</div>`;
    return;
  }

  productGrid.innerHTML = filtered.map(product => {
    const firstVariant = product.variants[0];
    const firstImage = firstVariant.images[0];

    return `
      <article class="product-card">
        <div class="product-img-wrap">
          ${product.featured ? `<span class="featured-badge">Destacado</span>` : ""}
          <span class="product-tag">${product.category}</span>
          <img src="${firstImage}" alt="${product.name}">
        </div>

        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.shortDescription}</p>

          <div class="mini-variants">
            ${product.variants.slice(0, 4).map(v => `<span>${v.color}</span>`).join("")}
          </div>

          <strong class="price">Desde ${money(minPrice(product))}</strong>

          <div class="card-actions">
            <a class="product-btn" href="producto.html?id=${product.id}">Ver detalles</a>
            <button class="quick-add" data-id="${product.id}">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".quick-add").forEach(button => {
    button.addEventListener("click", () => {
      const product = products.find(p => p.id === button.dataset.id);
      const variant = product.variants[0];

      addToCart({
        productId: product.id,
        name: product.name,
        variantName: variant.name,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        image: variant.images[0],
        quantity: 1
      });
    });
  });
}

function setupCatalogControls() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  searchInput?.addEventListener("input", renderProducts);
  sortSelect?.addEventListener("change", renderProducts);

  renderCategories();
  renderProducts();
}

setupCartControls();
setupCatalogControls();
updateCartUI();
