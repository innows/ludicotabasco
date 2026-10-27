(function ($) {
  "use strict";

  var STORAGE_KEY = "ludico_quote_cart";
  var FALLBACK_IMAGE = "assets/images/default-product.webp";

  function getCart() {
    try {
      var cart = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      return Array.isArray(cart) ? cart.filter(function (item) {
        return item && typeof item.name === "string" && item.name.trim() !== "";
      }) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // La interfaz sigue operando si el navegador bloquea localStorage.
    }
  }

  function quantityFor(value) {
    var quantity = parseInt(value, 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  }

  function cartQuantity(cart) {
    return cart.reduce(function (total, product) {
      return total + quantityFor(product.quantity);
    }, 0);
  }

  function emitCartUpdate() {
    $(document).trigger("quoteCartUpdated");
  }

  function openCart() {
    $(".sidebar-cart").addClass("cart-open");
    $(".offcanvas-overlay").addClass("overlay-open");
  }

  function closeCart() {
    $(".sidebar-cart").removeClass("cart-open");
    $(".offcanvas-overlay").removeClass("overlay-open");
  }

  function renderCart() {
    var cart = getCart();
    var $list = $(".sidebar-action-list");

    $list.empty();

    cart.forEach(function (product, index) {
      var $item = $("<div>", { "class": "sidebar-list-item" });
      var $image = $("<img>", {
        src: product.image || FALLBACK_IMAGE,
        alt: product.name,        
        loading: "lazy"
      });
      var $removeButton = $("<button>", {
        type: "button",
        "class": "remove-cart-item remove-item",
        "data-index": index,
        "aria-label": "Eliminar " + product.name,
        title: "Eliminar producto"
      }).append($("<i>", { "class": "fa fa-times", "aria-hidden": "true" }));

      $item
        .append($("<div>", { "class": "product-image pos-rel" }).append($image))
        .append($("<div>", { "class": "product-desc" }).append(
          $("<div>", { "class": "product-name" }).text(product.name)
        ))
        .append($removeButton);
      $list.append($item);
    });

    $(".cart-count").text(cartQuantity(cart));
    $("#cartEmptyMsg").toggle(cart.length === 0);
    $("#cartActionBtn").toggle(cart.length > 0);
  }

  function updateItemQuantity(index, quantity) {
    var cart = getCart();

    if (!Number.isInteger(index) || index < 0 || index >= cart.length) {
      return false;
    }

    cart[index].quantity = quantityFor(quantity);
    saveCart(cart);
    renderCart();
    emitCartUpdate();
    return true;
  }

  function removeItem(index) {
    var cart = getCart();

    if (!Number.isInteger(index) || index < 0 || index >= cart.length) {
      return false;
    }

    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    emitCartUpdate();
    return true;
  }

  window.quoteCart = {
    getCart: getCart,
    removeItem: removeItem,
    updateItemQuantity: updateItemQuantity
  };

  $(document).ready(function () {
    //mostrar el div de los productos del carrito
    renderCart();

    $(document).on("click", "#cart", function (event) {
      event.preventDefault();
      openCart();
    });

    $(document).on("click", ".close-sidebar, .offcanvas-overlay", closeCart);
    // Agregar al carrito
    $("#addcart").on("click", function (e) {
      e.preventDefault();
      var productId = $(this).data("product-id");
      var quantity = 1; // Puedes cambiar esto según tus necesidades
      var productImage = $(this).data("product-image");
      var productName = $(this).data("product-name");
      var productSku = $(this).data("sku");
    });

    $("#addcart").off("click");

    $(document).on("click", "#addcart", function (event) {
      event.preventDefault();

      var $button = $(this);
      var name = String($button.data("product-name") || "").trim();
      var productId = String($button.data("product-id") || "");
      var $quantityInput = $button.closest(".quantity-area").find(".input").first();
      var quantity = quantityFor($quantityInput.val());
      if (!name) {
        return;
      }

      var cart = getCart();
      var itemIndex = cart.findIndex(function (product) {
        return productId !== "" && String(product.id || "") === productId;
      });

      if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantityFor(cart[itemIndex].quantity) + quantity;
      } else {
        cart.push({
          id: productId,
          name: name,
          image: String($button.data("product-image") || FALLBACK_IMAGE),
          quantity: quantity
        });
      }

      saveCart(cart);
      renderCart();
      emitCartUpdate();
      openCart();
    });

    // Control genérico para los selectores de cantidad del detalle y la cotización.
    $(document).on("click", ".btn-minus, .btn-plus", function () {
      var $button = $(this);
      var $quantityInput = $button.closest(".quantity-edit").find(".input").first();
      var quantity = quantityFor($quantityInput.val());
      var newQuantity = $button.hasClass("btn-plus") ? quantity + 1 : Math.max(1, quantity - 1);
      var $row = $button.closest("tr[data-index]");

      $quantityInput.val(newQuantity);

      if ($row.length) {
        updateItemQuantity(Number($row.data("index")), newQuantity);
      }
    });

    $(document).on("change", "#itemsCotizacion .item-quantity", function () {
      var $row = $(this).closest("tr[data-index]");
      var quantity = quantityFor($(this).val());

      $(this).val(quantity);
      updateItemQuantity(Number($row.data("index")), quantity);
    });

    $(document).on("click", ".remove-cart-item", function () {
      removeItem(Number($(this).data("index")));
    });
  });
})(jQuery);
