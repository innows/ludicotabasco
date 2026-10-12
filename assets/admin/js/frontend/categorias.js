$(function () {
  const endpoints = {
    list: "categorias/list",
    obtener: "categorias/obtener",
    guardar: "categorias/guardar",
    eliminar: "categorias/eliminar",
  };

  const $tableBody = $("#tabCategorias tbody");
  const $form = $("#frmCategoria");
  const $modal = $("#modCategorias");

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

  function clearMessage() {
    // SweetAlert handles messages directly
  }

  function createSlug(value) {
    return value
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function resetForm() {
    $form[0].reset();
    $form.find("#id").val("");
    $form.find("#slug").val("");
    clearMessage();
  }

  function renderCategories(categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      $tableBody.html(
        '<tr><td colspan="5" class="text-center">No hay categorías activas.</td></tr>',
      );
      return;
    }

    const rows = categories.map(function (category) {
      const image = category.imagen_url
        ? `<img src="../app/${category.imagen_url}" alt="${category.nombre}" class="img-fluid" style="max-width: 80px;" />`
        : '<span class="text-muted">Sin imagen</span>';
      return `
                <tr>
                    <td>${category.id}</td>
                    <td>${image}</td>
                    <td>${category.nombre}</td>
                    <td>${category.descripcion || ""}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-warning btn-edit" data-id="${category.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button type="button" class="btn btn-sm btn-danger btn-delete" data-id="${category.id}"><i class="fa-regular fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
    });

    $tableBody.html(rows.join(""));
  }

  function loadCategories() {
    $.get(endpoints.list)
      .done(function (response) {
        if (response.success) {
          renderCategories(response.data);
        } else {
          showMessage(
            response.message || "Error cargando categorías",
            "danger",
          );
        }
      })
      .fail(function () {
        showMessage("Error de servidor al cargar las categorías", "danger");
      });
  }

  function loadCategory(id) {
    $.get(endpoints.obtener, { id: id })
      .done(function (response) {
        if (response.success) {
          const category = response.data;
          $form.find("#id").val(category.id);
          $form.find("#nombre").val(category.nombre);
          $form.find("#descripcion").val(category.descripcion);
          $form.find("#slug").val(category.slug);
          $modal.find(".modal-title").text("Editar categoría");
          $modal.modal("show");
        } else {
          showMessage(response.message || "Categoría no encontrada", "danger");
        }
      })
      .fail(function () {
        showMessage("Error de servidor al obtener la categoría", "danger");
      });
  }

  function saveCategory() {
    const nombre = $.trim($form.find("#nombre").val());
    if (!nombre) {
      showMessage("El nombre de la categoría es obligatorio.", "danger");
      return;
    }

    const formData = new FormData($form[0]);
    formData.set("slug", createSlug(nombre));

    $.ajax({
      url: endpoints.guardar,
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        if (response.success) {
          showMessage(response.message, "success");
          resetForm();
          $modal.modal("hide");
          loadCategories();
        } else {
          showMessage(
            response.message || "Error al guardar la categoría",
            "danger",
          );
        }
      },
      error: function () {
        showMessage("Error de servidor al guardar la categoría", "danger");
      },
    });
  }

  function deleteCategory(id) {
    Swal.fire({
      title: "Confirmar eliminación",
      text: "¿Deseas eliminar esta categoría?",
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
              loadCategories();
            } else {
              showMessage(
                response.message || "Error al eliminar la categoría",
                "danger",
              );
            }
          })
          .fail(function () {
            showMessage("Error de servidor al eliminar la categoría", "danger");
          });
      }
    });
  }

  $("#nombre").on("input", function () {
    const slug = createSlug($(this).val());
    $form.find("#slug").val(slug);
  });

  $("#btGuardar").on("click", function () {
    saveCategory();
  });

  $tableBody.on("click", ".btn-edit", function () {
    const id = $(this).data("id");
    loadCategory(id);
  });

  $tableBody.on("click", ".btn-delete", function () {
    const id = $(this).data("id");
    deleteCategory(id);
  });

  $modal.on("hidden.bs.modal", function () {
    resetForm();
    $modal.find(".modal-title").text("Categoria");
  });

  loadCategories();
});
