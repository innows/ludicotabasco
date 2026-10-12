$(function () {
  const endpoints = {
    list: "subcategorias/list",
    obtener: "subcategorias/obtener",
    guardar: "subcategorias/guardar",
    eliminar: "subcategorias/eliminar",
  };

  const $tableBody = $("#tabSubcategorias tbody");
  const $form = $("#frmSubcategoria");
  const $modal = $("#modSubcategorias");

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
    $form.find("#Subcategoria_ID").val("");
    $form.find("#slug_subcategoria").val("");
    clearMessage();
  }

  function renderCategories(categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      $tableBody.html(
        '<tr><td colspan="5" class="text-center">No hay subcategorías activas.</td></tr>',
      );
      return;
    }

    const rows = categories.map(function (category) {
      const image = category.imagen_url
        ? `<img src="../app/${category.imagen}" alt="${category.Subcategoria}" class="img-fluid" style="max-width: 80px;" />`
        : '<span class="text-muted">Sin imagen</span>';
      return `
                <tr>
                    <td>${category.Subcategoria_ID}</td>
                    <td>${image}</td>
                    <td>${category.Subcategoria}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-warning btn-edit" data-id="${category.Subcategoria_ID}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button type="button" class="btn btn-sm btn-danger btn-delete" data-id="${category.Subcategoria_ID}"><i class="fa-regular fa-trash-can"></i></button>
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
          $form.find("#Subcategoria_ID").val(category.Subcategoria_ID);
          $form.find("#nombre").val(category.Subcategoria);
          $form.find("#slug_subcategoria").val(category.slug_subcategoria);
          $modal.find(".modal-title").text("Editar subcategoría");
          $modal.modal("show");
        } else {
          showMessage(
            response.message || "Subcategoría no encontrada",
            "danger",
          );
        }
      })
      .fail(function () {
        showMessage("Error de servidor al obtener la subcategoría", "danger");
      });
  }

  function saveCategory() {
    const nombre = $.trim($form.find("#nombre").val());
    if (!nombre) {
      showMessage("El nombre de la subcategoría es obligatorio.", "danger");
      return;
    }

    const formData = new FormData($form[0]);
    formData.set("slug_subcategoria", createSlug(nombre));

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
            response.message || "Error al guardar la subcategoría",
            "danger",
          );
        }
      },
      error: function () {
        showMessage("Error de servidor al guardar la subcategoría", "danger");
      },
    });
  }

  function deleteCategory(id) {
    Swal.fire({
      title: "Confirmar eliminación",
      text: "¿Deseas eliminar esta subcategoría?",
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
                response.message || "Error al eliminar la subcategoría",
                "danger",
              );
            }
          })
          .fail(function () {
            showMessage(
              "Error de servidor al eliminar la subcategoría",
              "danger",
            );
          });
      }
    });
  }

  $("#nombre").on("input", function () {
    const slug = createSlug($(this).val());
    $form.find("#slug_subcategoria").val(slug);
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
