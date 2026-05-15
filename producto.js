const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const product = products.find(item => item.id === productId);

const productDetail = document.getElementById("productDetail");
const productImage = document.getElementById("productImage");
const thumbnailList = document.getElementById("thumbnailList");
const productCategory = document.getElementById("productCategory");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const variantButtons = document.getElementById("variantButtons");
const singleWhatsappButton = document.getElementById("singleWhatsappButton");
const addToCartBtn = document.getElementById("addToCartBtn");
const quantityValue = document.getElementById("quantityValue");
const increaseQty = document.getElementById("increaseQty");
const decreaseQty = document.getElementById("decreaseQty");
const specsGrid = document.getElementById("specsGrid");
const sizeButtons = document.getElementById("sizeButtons");

let selectedVariant = null;
let selectedVariantIndex = 0;
let quantity = 1;
let selectedSize = null;

if (!product) {
  productDetail.innerHTML = `
    <div class="empty">
      <h2>Producto no encontrado</h2>
      <p>Verifica el enlace o vuelve al catálogo.</p>
      <a class="product-btn" href="index.html">Volver</a>
    </div>
  `;
} else {
  document.title = `${product.name} | ${BUSINESS_NAME}`;

  productCategory.textContent = product.category;
  productName.textContent = product.name;
  productDescription.textContent = product.description;

  specsGrid.innerHTML = product.specs.map(spec => `<div>${spec}</div>`).join("");

  function updateSingleWhatsapp() {
  const message = encodeURIComponent(
    `Hola, estoy interesado en ${product.name}. Color: ${selectedVariant.color}. Talla: ${selectedSize}. Precio: ${money(selectedVariant.price)}. Cantidad: ${quantity}. ¿Me puedes dar más información?`
  );

  singleWhatsappButton.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

  function setActiveVariant(index) {
    document.querySelectorAll(".variant-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });
  }

  function setActiveThumbnail(index) {
    document.querySelectorAll(".thumbnail").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });
  }

  function renderThumbnails(variant) {
    thumbnailList.innerHTML = "";

    variant.images.forEach((image, index) => {
      const thumb = document.createElement("button");
      thumb.className = "thumbnail";
      thumb.innerHTML = `<img src="${image}" alt="${product.name} ${variant.name} imagen ${index + 1}">`;

      thumb.addEventListener("click", () => {
        productImage.src = image;
        setActiveThumbnail(index);
      });

      thumbnailList.appendChild(thumb);
    });

    productImage.src = variant.images[0];
    productImage.alt = `${product.name} ${variant.name}`;
    setActiveThumbnail(0);
  }

        function selectVariant(variant, index) {
      selectedVariant = variant;
      selectedVariantIndex = index;

      productPrice.textContent = money(variant.price);

      renderThumbnails(variant);
      renderSizes(variant);
      updateSingleWhatsapp();
      setActiveVariant(index);
}

      function renderSizes(variant) {
        sizeButtons.innerHTML = "";

        selectedSize = variant.sizes[0];

        variant.sizes.forEach(size => {
          const button = document.createElement("button");
          button.className = "size-btn";
          button.textContent = size;

          if (size === selectedSize) {
            button.classList.add("active");
          }

          button.addEventListener("click", () => {
            selectedSize = size;

            document.querySelectorAll(".size-btn").forEach(btn => {
              btn.classList.remove("active");
            });

            button.classList.add("active");
            updateSingleWhatsapp();
          });

          sizeButtons.appendChild(button);
        });
      }

  product.variants.forEach((variant, index) => {
    const button = document.createElement("button");
    button.className = "variant-btn";

        button.innerHTML = `
      <span>${variant.color}</span>
    `;

    button.addEventListener("click", () => {
      selectVariant(variant, index);
    });

    variantButtons.appendChild(button);
  });

  increaseQty.addEventListener("click", () => {
    quantity++;
    quantityValue.textContent = quantity;
    updateSingleWhatsapp();
  });

  decreaseQty.addEventListener("click", () => {
    if (quantity > 1) quantity--;
    quantityValue.textContent = quantity;
    updateSingleWhatsapp();
  });

  addToCartBtn.addEventListener("click", () => {
  addToCart({
    productId: product.id,
    name: product.name,
    variantName: selectedVariant.name,
    color: selectedVariant.color,
    size: selectedSize,
    price: selectedVariant.price,
    image: selectedVariant.images[0],
    quantity
    });
  });

  selectVariant(product.variants[0], 0);
}
