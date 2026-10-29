(function ($) {
  "use strict";

  function showMessage(icon, title, message) {
    if (window.Swal) {
      window.Swal.fire({ icon: icon, title: title, text: message });
      return;
    }

    window.alert(message);
  }

  $(function () {
    var $form = $("#contactoForm");

    if (!$form.length) {
      return;
    }

    $form.on("submit", function (event) {
      event.preventDefault();

      var $button = $form.find("button[type='submit']");
      var originalText = $button.text();
      var payload = {
        name: $.trim($form.find("[name='name']").val()),
        empresa: $.trim($form.find("[name='empresa']").val()),
        estado: $.trim($form.find("[name='idEstado']").val()),
        email: $.trim($form.find("[name='email']").val()),
        phone: $.trim($form.find("[name='phone']").val()),
        message: $.trim($form.find("[name='message']").val())
      };

      if (payload.name.length < 2 || !payload.email || payload.message.length < 5) {
        showMessage("warning", "Datos incompletos", "Ingresa tu nombre, correo y un mensaje de al menos 5 caracteres.");
        return;
      }

      $button.prop("disabled", true).addClass("disabled").text("Enviando...");

      $.ajax({
        url: 'contacto/enviarContacto',
        method: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(payload)
      })
        .done(function (response) {
          if (!response || !response.success) {
            showMessage("error", "No fue posible enviar", (response && response.message) || "Intenta nuevamente más tarde.");
            return;
          }

          $form[0].reset();
          showMessage("success", "Mensaje enviado", response.message || "Recibimos tu mensaje.");
        })
        .fail(function (xhr) {
          var response = xhr.responseJSON || {};
          showMessage("error", "No fue posible enviar", response.message || "Intenta nuevamente más tarde.");
        })
        .always(function () {
          $button.prop("disabled", false).removeClass("disabled").text(originalText);
        });
    });
  });
})(jQuery);
