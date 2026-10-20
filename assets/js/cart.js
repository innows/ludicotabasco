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

    $(".cart-count").text(cart.length);
    $("#cartEmptyMsg").toggle(cart.length === 0);
    $("#cartActionBtn").toggle(cart.length > 0);
  }

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

    // Sustituye el manejador heredado anterior por el delegado de abajo.
    $("#addcart").off("click");

    $(document).on("click", "#addcart", function (event) {
      event.preventDefault();

      var $button = $(this);
      var name = String($button.data("product-name") || "").trim();
      if (!name) {
        return;
      }

      var cart = getCart();
      cart.push({
        id: String($button.data("product-id") || ""),
        name: name,
        image: String($button.data("product-image") || FALLBACK_IMAGE)
      });

      saveCart(cart);
      renderCart();
      openCart();
    });

    $(document).on("click", ".remove-cart-item", function () {
      var index = Number($(this).data("index"));
      var cart = getCart();

      if (!Number.isInteger(index) || index < 0 || index >= cart.length) {
        return;
      }

      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });
  });
})(jQuery);
