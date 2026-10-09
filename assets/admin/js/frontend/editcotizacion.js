// Variables globales
let partidasArray = [];
let partidaCounter = 0;

const adminPath = window.location.pathname.replace(/\/cotizaciones.*$/, '');

const endpoints = {
  serviciosList: adminPath + '/servicios/list',
  serviciosGuardar: adminPath + '/servicios/guardar',
  materialesList: adminPath + '/materiales/list',
  materialesObtener: adminPath + '/materiales/obtener',
  cotizacionActualizar: adminPath + '/cotizaciones/actualizar',
  eliminarPartida: adminPath + '/cotizaciones/eliminar-partida'
};

function parseNumber(value) {
  if (value === undefined || value === null) {
    return 0;
  }
  return parseFloat(String(value).replace(/,/g, '').trim()) || 0;
}

// Cargar partidas existentes al iniciar
function cargarPartidasExistentes() {
  let $tbody = $("#tabPartidas tbody");

  $tbody.find("tr").each(function() {
    let $row = $(this);
    let iddata = $row.data("id");

    if (iddata) {
        let cantidad = parseNumber($row.find("input[name='cantidad']").val());
        let precioUnitario = parseNumber($row.find("input[name='precioUnitario']").val());
      let nombre = $row.find("td:eq(2)").text();
      let imagen = $row.find("img").attr("src");
      let importe = cantidad * precioUnitario;

      partidasArray.push({
        id: iddata,
        iddata: iddata,
        materialId: iddata,
        nombre: nombre,
        imagen: imagen,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        importe: importe,
        partida: 0,
        existente: true
      });
    }
  });

  if (partidasArray.length > 0) {
    partidaCounter = Math.max(...partidasArray.map(p => p.id || 0)) + 1;
  } else {
    partidaCounter = 1;
  }

  updateTotals();
}

// Inicializar Select2 para materiales
$("#materialID").select2({
  placeholder: "Seleccionar servicio o agregue uno nuevo",
  allowClear: true,
  width: "100%",
  tags: true,
  ajax: {
    url: endpoints.materialesList,
    dataType: "json",
    delay: 250,
    processResults: function (data) {
      if (!data || !data.data) return { results: [] };
      return { results: data.data };
    },
  },
  createTag: function (params) {
    let term = $.trim(params.term);
    if (term === "") {
      return null;
    }
    return {
      id: "new_" + term.replace(/\s+/g, "_").toLowerCase(),
      text: term,
      newTag: true,
      partida: 1,
    };
  },
  templateResult: function (item) {
    if (!item.id) return item.text;
    let badge =
      item.partida === 0
        ? "Producto"
        : item.partida === 1
          ? "Servicio"
          : "Nuevo";
    return $("<span>")
      .text(item.text + " ")
      .append($('<small class="text-muted">').text("(" + badge + ")"));
  },
});

// Cuando se selecciona un material
$("#materialID").on("select2:select", function (e) {
  let data = e.params.data;

  let $opt = $(this).find('option[value="' + data.id + '"]');
  if ($opt.length === 0) {
    $opt = $("<option>")
      .val(data.id)
      .text(data.text)
      .attr("data-partida", data.partida ?? 1);
    $(this).append($opt);
  } else {
    $opt.attr("data-partida", data.partida ?? 0);
  }

  if (!data.newTag) {
    $.ajax({
      url: endpoints.materialesObtener,
      method: "GET",
      data: { id: data.id },
      dataType: "json",
      success: function (response) {
        if (response.success && response.data) {
          $("#precioUnitario").val(response.data.precio.toFixed(2));
          $("#materialID").data("material-info", {
            id: data.id,
            nombre: response.data.nombre || response.data.text,
            imagen: response.data.imagen,
            partida: response.data.partida,
          });
        }
      },
      error: function () {
        $("#precioUnitario").val("");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al obtener el precio del material",
        });
      },
    });
  }
});

// Agregar partida
$("#btnAddPartida").on("click", function (e) {
  e.preventDefault();

  let $select = $("#materialID");
  let selected = $select.select2("data") || [];
  let newItems = selected.filter(function (i) {
    return i.newTag === true;
  });

  let addPartidaToTable = function () {
    let materialId = $select.val();
    let cantidad = parseFloat($("#cantidad").val());
    let precioUnitario = parseFloat($("#precioUnitario").val());

    if (!materialId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar un material",
      });
      return;
    }
    if (!cantidad || cantidad <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe ingresar una cantidad válida",
      });
      return;
    }
    if (isNaN(precioUnitario) || precioUnitario < 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe ingresar un precio unitario válido",
      });
      return;
    }

    let materialInfo = $select.data("material-info") || {};
    let importe = cantidad * precioUnitario;

    let partida = {
      id: partidaCounter,
      materialId: materialId,
      nombre: materialInfo.nombre || $("#materialID option:selected").text(),
      imagen: materialInfo.imagen || null,
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      importe: importe,
      partida: materialInfo.partida || 1,
    };

    partidasArray.push(partida);

    let imageHtml = partida.imagen
      ? `<img src="${adminPath}/administrador/uploads/productos/${partida.imagen}" alt="${partida.nombre}" width="50">`
      : '<span class="text-muted">N/A</span>';
    let deleteBtn = `<button type="button" class="btn btn-sm btn-danger btn-delete-partida" data-id="${partida.id}"><i class="fas fa-trash"></i></button>`;

    let $tbody = $("#tabPartidas tbody");

    if ($tbody.find("tr").length === 1 && $tbody.find("tr").find("td").length === 1 && $tbody.find("tr").find("td").text().includes("No hay partidas")) {
      $tbody.empty();
    }

    $tbody.append(`
      <tr data-partida-id="${partida.partida} " data-id="${partida.id}">
        <td>${partida.id}</td>
        <td>${imageHtml}</td>
        <td>${partida.nombre}</td>
        <td><input type="number" class="form-control editable-cantidad" step="0.01" min="0" value="${partida.cantidad}" data-id="${partida.id}"/></td>
        <td><input type="number" class="form-control editable-precio" step="0.01" min="0" value="${partida.precioUnitario.toFixed(2)}" data-id="${partida.id}"/></td>
        <td><span class="importe-display" data-id="${partida.id}">$ ${partida.importe.toFixed(2)}</span></td>
        <td>${deleteBtn}</td>
      </tr>
    `);

    partidaCounter++;
    updateTotals();

    $select.val(null).trigger("change");
    $("#cantidad").val("");
    $("#precioUnitario").val("");
    $select.focus();
  };

  if (newItems.length > 0) {
    let requests = newItems.map(function (item) {
      return $.ajax({
        url: endpoints.serviciosGuardar,
        method: "POST",
        data: { nombre: item.text },
        dataType: "json",
      });
    });

    $.when.apply($, requests)
      .done(function () {
        let responses = arguments;
        if (newItems.length === 1) {
          responses = [arguments];
        }

        for (let i = 0; i < responses.length; i++) {
          let resp = responses[i][0];
          if (resp && resp.success && resp.data) {
            let created = resp.data;
            let current = $select.val() || [];
            current = current.map(function (v) {
              return v === newItems[i].id ? created.id : v;
            });
            $select.val(current).trigger("change");
          }
        }

        setTimeout(addPartidaToTable, 500);
      })
      .fail(function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al guardar nuevos servicios.",
        });
      });
  } else {
    addPartidaToTable();
  }
});

// Editar cantidad (evento delegado)
$(document).on("change", ".editable-cantidad", function () {
  let id = $(this).data("id");
  let nuevaCantidad = parseNumber($(this).val());

  let partida = partidasArray.find(p => p.id === id);
  if (partida) {
    partida.cantidad = nuevaCantidad;
    partida.importe = partida.cantidad * partida.precioUnitario;
    $(`.importe-display[data-id="${id}"]`).text("$ " + partida.importe.toFixed(2));
    updateTotals();
  }
});

// Editar precio unitario (evento delegado)
$(document).on("change", ".editable-precio", function () {
  let id = $(this).data("id");
  let nuevoPrecio = parseNumber($(this).val());

  let partida = partidasArray.find(p => p.id === id);
  if (partida) {
    partida.precioUnitario = nuevoPrecio;
    partida.importe = partida.cantidad * partida.precioUnitario;
    $(`.importe-display[data-id="${id}"]`).text("$ " + partida.importe.toFixed(2));
    updateTotals();
  }
});

// Eliminar partida de la tabla (btn-delete-partida)
$(document).on("click", ".btn-delete-partida", function () {
  let id = $(this).data("id");

  partidasArray = partidasArray.filter(function (p) {
    return p.id !== id;
  });

  $(`#tabPartidas tbody tr[data-partida-id="${id}"]`).remove();

  updateTotals();
});

// Eliminar partida de BD (btn-eliminar)
$(document).on("click", ".btn-eliminar", function () {
  let detalleId = $(this).data("id");

  Swal.fire({
    title: '¿Eliminar partida?',
    text: "¿Está seguro que desea eliminar esta partida?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: endpoints.eliminarPartida,
        method: "POST",
        data: { id: detalleId },
        dataType: "json",
        success: function (response) {
          if (response.success) {
            $(`#tabPartidas tbody tr[data-id="${detalleId}"]`).remove();

            partidasArray = partidasArray.filter(p => p.iddata !== detalleId);

            updateTotals();
            Swal.fire('Eliminada', response.message, 'success');
          } else {
            Swal.fire('Error', response.message, 'error');
          }
        },
        error: function () {
          Swal.fire('Error', 'Error al eliminar la partida', 'error');
        }
      });
    }
  });
});

// Cambio de descuento
$("#descuento").on("input", function () {

  updateTotals();
});

// Actualizar totales
function updateTotals() {
  let subtotal = 0;

  partidasArray.forEach(function (p) {
    subtotal += p.importe || 0;
  });

  let ivaValue = parseInt($("#iva")?.val() || 0);
  let ivaPercent = ivaValue === 1 ? 0.16 : 0;
  let iva = subtotal * ivaPercent;

  let descuentoValue = parseFloat($("#descuento").val()) || 0;
  let descuento = subtotal * (descuentoValue / 100);

  let total = subtotal + iva - descuento;

  $(".subtotal").text("$ " + subtotal.toFixed(2));
  $(".iva").text("$ " + iva.toFixed(2));
  $(".descuento").text("$ " + descuento.toFixed(2));
  $(".grantotal").text("$ " + total.toFixed(2));
  $("#nuevoTotal").val(total.toFixed(2));
}

// Actualizar cotización
$("#btnUpdate").on("click", function () {
  if (partidasArray.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe agregar al menos una partida a la cotización",
    });
    return;
  }

  $.ajax({
    url: endpoints.cotizacionActualizar,
    method: "POST",
    data: {
      id: $("#cotizacionId").val(),
      partidas: JSON.stringify(partidasArray),
      observaciones: $("#observaciones").val(),
      descuento: $("#descuento").val(),
    }
  }).done(function (response) {
    if (response.success) {
      Swal.fire({
        icon: "success",
        title: "Cotización actualizada",
        text: response.message,
      }).then(function () {
        window.location.href = adminPath + "/cotizaciones/editar/id=" + $("#cotizacionId").val();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: response.message || "Error al actualizar la cotización",
      });
    }
  }).fail(function () {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al actualizar la cotización",
    });
  });
});

// Inicializar al cargar la página
$(document).ready(function() {
  cargarPartidasExistentes();
});
