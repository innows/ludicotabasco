(function ($) {
  "use strict";

  var STORAGE_KEY = "ludico_quote_cart";
  var FALLBACK_IMAGE = "assets/images/default-product.webp";

  function getCart() {
    try {
      var cart = JSON.parse(window.localStorage.getItem(STORAGE_KEY));

      return Array.isArray(cart)
        ? cart.filter(function (item) {
            return (
              item && typeof item.name === "string" && item.name.trim() !== ""
            );
          })
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // La tabla sigue mostrando sus datos aunque localStorage no est\u00e9 disponible.
    }
  }

  function quantityFor(item) {
    var quantity = parseInt(item.quantity, 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  }

  function removeItems(index) {
    if (window.quoteCart && window.quoteCart.removeItem(index)) {
      // quoteCartUpdated redibuja el tbody después de actualizar el storage.
      return;
    }

    // Respaldo si cart.js no estuviera cargado.
    var cart = getCart();
    if (Number.isInteger(index) && index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    }
  }

  function renderCart() {
    var cart = getCart();
    var $body = $("#itemsCotizacion tbody");

    if (!$body.length) {
      return;
    }

    $body.empty();

    if (!cart.length) {
      $body.append(
        $("<tr>").append(
          $("<td>", {
            colspan: 4,
            class: "text-center",
          }).text("No hay productos en tu cotizaci\u00f3n."),
        ),
      );
      return;
    }

    cart.forEach(function (product, index) {
      var name = product.name.trim();
      var $row = $("<tr>", {
        class: "woocommerce-cart-form__cart-item cart_item",
        "data-index": index,
        "data-product-id": product.id
      });
      var $image = $("<img>", {
        src: product.image || FALLBACK_IMAGE,
        class: "attachment-woocommerce_thumbnail size-woocommerce_thumbnail",
        alt: name,
        loading: "lazy",
      });
      var $minus = $("<button>", {
        type: "button",
        class: "button minus btn-minus",
        "aria-label": "Reducir cantidad de " + name,
      }).append($("<i>", { class: "fal fa-minus", "aria-hidden": "true" }));
      var $plus = $("<button>", {
        type: "button",
        class: "button plus btn-plus",
        "aria-label": "Aumentar cantidad de " + name,
      }).append($("<i>", { class: "fal fa-plus", "aria-hidden": "true" }));
      var $quantity = $("<input>", {
        type: "text",
        class: "input item-quantity",
        min: 1,
        value: quantityFor(product),
        "aria-label": "Cantidad de " + name,
      });
      var $remove = $("<button>", {
        type: "button",
        class: "remove removeItems border-0",
        "data-index": index,
        "aria-label": "Eliminar " + name,
        "data-bs-toggle": "tooltip",
        "data-bs-placement": "top",
        title: "Eliminar producto",
      }).append(
        $("<i>", {
          class: "fa-sharp fa-light fa-square-xmark",
          "aria-hidden": "true",
        }),
      );
      $row
        .append($("<td>", { class: "product-thumbnail" }).append($image))
        .append(
          $("<td>", { class: "product-name", "data-title": "Producto" }).text(
            name,
          ),
        )
        .append(
          $("<td>", {
            class: "product-quantity",
            "data-title": "Cantidad",
          }).append(
            $("<div>", { class: "quantity-area mb-0" }).append(
              $("<div>", { class: "cart-edit" }).append(
                $("<div>", { class: "quantity-edit" }).append(
                  $minus,
                  $quantity,
                  $plus,
                ),
              ),
            ),
          ),
        )
        .append($("<td>", { class: "product-remove" }).append($remove));

      $body.append($row);
    });
  }

  $(function () {
    renderCart();

    $("#itemsCotizacion")
      .on("click", ".removeItems", function () {
        removeItems(Number($(this).data("index")));
      });

    $(document).on("quoteCartUpdated", renderCart);
  });
})(jQuery);
