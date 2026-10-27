$(function () {
  const endpoint = $("#frmLogos").data("endpoint");
  const endpoints = {
    list: `${endpoint}/list`,
    obtener: `${endpoint}/obtener`,
    guardar: `${endpoint}/guardar`,
    eliminar: `${endpoint}/eliminar`,
  };

  const $tableBody = $("#tabLogos tbody");
  const $form = $("#frmLogos");
  const $modal = $("#modLogos");

  function showMessage(text, type = "success") {
    Swal.fire({
      title: type === "success" ? "Éxito" : "Error",
      text: text,
      icon: type === "success" ? "success" : "error",
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: "btn btn-primary",
      },
      buttonsStyling: false,
    });
  }

  function resetForm() {
    $form[0].reset();
    $form.find("#id").val("");
    $form.find("#imagen").val("");
  }

  function renderLogos(logos) {
    if (!Array.isArray(logos) || logos.length === 0) {
      $tableBody.html('<tr><td colspan="4" class="text-center">No hay logos registrados.</td></tr>');
      return;
    }

    const $rows = logos.map(function (logo) {
      const $row = $("<tr>");
      const $imageCell = $("<td>");
      if (logo.imagen_url) {
        $("<img>")
          .attr({
            src: $form.data("image-base") + logo.imagen_url,
            alt: logo.nombre,
          })
          .addClass("img-fluid")
          .css("max-width", "80px")
          .appendTo($imageCell);
      } else {
        $imageCell.append($("<span>").addClass("text-muted").text("Sin imagen"));
      }

      $("<td>").text(logo.id).appendTo($row);
      $row.append($imageCell);
      $("<td>").text(logo.nombre).appendTo($row);

      const $actions = $("<td>");
      $("<button>")
        .attr({ type: "button", "data-id": logo.id, title: "Editar" })
        .addClass("btn btn-sm btn-warning btn-edit")
        .html('<i class="fa-solid fa-pen-to-square"></i>')
        .appendTo($actions);
      $("<button>")
        .attr({ type: "button", "data-id": logo.id, title: "Eliminar" })
        .addClass("btn btn-sm btn-danger btn-delete ms-1")
        .html('<i class="fa-regular fa-trash-can"></i>')
        .appendTo($actions);
      $row.append($actions);
      return $row;
    });

    $tableBody.empty().append($rows);
  }

  function loadLogos() {
    $.get(endpoints.list)
      .done(function (response) {
        if (response.success) {
          renderLogos(response.data);
        } else {
          showMessage(response.message || "Error al cargar los logos", "error");
        }
      })
      .fail(function () {
        showMessage("Error de servidor al cargar los logos", "error");
      });
  }

  function loadLogo(id) {
    $.get(endpoints.obtener, { id: id })
      .done(function (response) {
        if (response.success) {
          const logo = response.data;
          $form.find("#id").val(logo.id);
          $form.find("#nombre").val(logo.nombre);
          $modal.find(".modal-title").text("Editar logo");
          $modal.modal("show");
        } else {
          showMessage(response.message || "Logo no encontrado", "error");
        }
      })
      .fail(function () {
        showMessage("Error de servidor al obtener el logo", "error");
      });
  }

  function saveLog() {
    const nombre = $.trim($form.find("#nombre").val());
    if (!nombre) {
      showMessage("El nombre del cliente o empresa es obligatorio.", "error");
      return;
    }

    const formData = new FormData($form[0]);
    if (!$form.find("#id").val() && !$form.find("#imagen")[0].files.length) {
      showMessage("Selecciona una imagen para el logo.", "error");
      return;
    }

    $.ajax({
      url: endpoints.guardar,
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      dataType: "json",
      success: function (response) {
        if (response.success) {
          showMessage(response.message, "success");
          resetForm();
          $modal.modal("hide");
          loadLogos();
        } else {
          showMessage(response.message || "Error al guardar el logo", "error");
        }
      },
      error: function () {
        showMessage("Error de servidor al guardar el logo", "error");
      },
    });
  }

  function deleteLogo(id) {
    Swal.fire({
      title: "Confirmar eliminación",
      text: "¿Deseas eliminar este logo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn btn-danger me-2",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.isConfirmed) {
        $.post(endpoints.eliminar, { id: id })
          .done(function (response) {
            if (response.success) {
              showMessage(response.message, "success");
              loadLogos();
            } else {
              showMessage(response.message || "Error al eliminar el logo", "error");
            }
          })
          .fail(function () {
            showMessage("Error de servidor al eliminar el logo", "error");
          });
      }
    });
  }


  $("#btGuardar").on("click", function () {
    saveLog();
  });

  $tableBody.on("click", ".btn-edit", function () {
    const id = $(this).data("id");
    loadLogo(id);
  });

  $tableBody.on("click", ".btn-delete", function () {
    const id = $(this).data("id");
    deleteLogo(id);
  });

  $modal.on("hidden.bs.modal", function () {
    resetForm();
    $modal.find(".modal-title").text("Logo");
  });

  loadLogos();
});
