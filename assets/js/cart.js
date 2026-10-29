(function ($) {
  "use strict";

  var STORAGE_KEY = "ludico_quote_cart";
  var FALLBACK_IMAGE = "assets/images/default-product.webp";

  function imageFor(value) {
    var image = String(value || FALLBACK_IMAGE).trim().replace(/\\(?=[:/])/g, "");
    var duplicatedUrl = image.match(/^https?:\/\/[^/]+\/(https?:\/\/.+)$/i);

    // Corrige artículos añadidos antes de arreglar la URL de la ficha de producto.
    return duplicatedUrl ? duplicatedUrl[1] : (image || FALLBACK_IMAGE);
  }

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
        src: imageFor(product.image),
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

  function clearCart() {
    saveCart([]);
    renderCart();
    emitCartUpdate();
  }

  window.quoteCart = {
    getCart: getCart,
    removeItem: removeItem,
    updateItemQuantity: updateItemQuantity,
    clearCart: clearCart
  };

  function showQuoteMessage(type, title, message) {
    if (window.Swal) {
      window.Swal.fire({ icon: type, title: title, text: message });
      return;
    }

    window.alert(message);
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
          image: imageFor($button.data("product-image")),
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
      console.log("clic")
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

    $(document).on("submit", "#contact-form", function (event) {
      event.preventDefault();

      var $form = $(this);
      var $button = $("#enviarCot");
      var cart = getCart();
      var tableItems = $("#itemsCotizacion tbody tr[data-index]").length;

      // La tabla y el almacenamiento deben contener al menos un producto real.
      if (!cart.length || !tableItems) {
        showQuoteMessage("warning", "Cotización vacía", "Agrega al menos un producto antes de enviar tu cotización.");
        return;
      }

      var payload = {
        name: $.trim($form.find("[name='name']").val()),
        empresa: $.trim($form.find("[name='empresa']").val()),
        phone: $.trim($form.find("[name='phone']").val()),
        email: $.trim($form.find("[name='email']").val()),
        estado: $.trim($form.find("[name='idEstado']").val()),
        message: $.trim($form.find("[name='message']").val()),
        items: cart
      };

      if (!payload.name || !payload.email) {
        showQuoteMessage("warning", "Datos incompletos", "Ingresa tu nombre y un correo electrónico válido.");
        return;
      }

      $button.prop("disabled", true).addClass("disabled").text("Enviando...");

      $.ajax({
        url: $form.data("quote-endpoint"),
        method: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(payload)
      })
        .done(function (response) {
          if (!response || !response.success) {
            showQuoteMessage("error", "No fue posible enviar", (response && response.message) || "Intenta nuevamente más tarde.");
            return;
          }

          clearCart();
          $form[0].reset();
          showQuoteMessage("success", "Cotización enviada", response.message || "Recibimos tu solicitud.");
        })
        .fail(function (xhr) {
          var response = xhr.responseJSON || {};
          showQuoteMessage("error", "No fue posible enviar", response.message || "Ocurrió un error al enviar la cotización.");
        })
        .always(function () {
          $button.prop("disabled", false).removeClass("disabled").text("Enviar cotización");
        });
    });
  });
})(jQuery);
