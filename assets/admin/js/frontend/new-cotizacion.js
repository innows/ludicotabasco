const adminPath = window.location.pathname;
const adminSearch = window.location.search;
const usesRouteQuery = /[?&]route=/.test(adminSearch);
const basePath = usesRouteQuery
  ? adminPath
  : adminPath.replace(/\/newcotizacion\/?$/, "");
const routeSeparator = usesRouteQuery ? "?route=" : "/";

const endpoint = (routeName) => `${basePath}${routeSeparator}${routeName}`;

const endpoints = {
  clientesList: endpoint("clientes/list"),
  serviciosList: endpoint("servicios/list"),
  materialesList: endpoint("materiales/list"),
  serviciosGuardar: endpoint("servicios/guardar"),
  materialesObtener: endpoint("materiales/obtener"),
  cotizacionCreate: endpoint("cotizaciones/create"),
};

// Array para almacenar las partidas
let partidasArray = [];
let partidaCounter = 1;

$("#tipoVenta").on("change", function () {
  let tipo = $(this).val();

  if (tipo == 1) {
    $("#dvCredit").removeClass("d-none");
  } else {
    $("#dvCredit").addClass("d-none");
    $("#plazo").val("");
  }
});

$("#clienteID").select2({
  placeholder: "Seleccionar cliente",
  allowClear: true,
  width: "100%",
  tags: true, // Permite crear nuevos registros
  minimumInputLength: 0,
  ajax: {
    url: endpoints.clientesList,
    dataType: "json",
    delay: 250,
    cache: true,
    data: function (params) {
      return {
        q: params.term || "",
      };
    },
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
      id: "new_" + term.replace(/\s+/g, "_").toLowerCase(), // ID temporal
      text: term,
      newTag: true,
    };
  },
  templateResult: function (item) {
    if (!item.id) return item.text;
    if (item.newTag) {
      return $("<span>")
        .text(item.text + " ")
        .append(
          $('<small class="text-muted"></small>').text("(Nuevo cliente)"),
        );
    }
    return item.text;
  },
  templateSelection: function (item) {
    if (!item.id) return item.text;
    return item.newTag ? item.text + " (nuevo)" : item.text;
  },
});

$("#materialID").select2({
  placeholder: "Seleccionar servicio o agregue uno nuevo",
  allowClear: true,
  width: "100%",
  tags: true,
  ajax: {
    url: endpoints.materialesList,
    dataType: "json",
    delay: 250,
    data: function (params) {
      return {
        q: params.term,
      };
    },
    processResults: function (data) {
      if (!data || !data.data) return { results: [] };
      return { results: data.data };
    },
    cache: true,
  },
  createTag: function (params) {
    let term = $.trim(params.term);
    if (term === "") return null;

    return {
      id: "serv_" + term.replace(/\s+/g, "_").toLowerCase(),
      text: term,
      newTag: true,
      precio: $("#precioUnitario").val() || 0,
      partida: 1,
    };
  },
  templateResult: function (item) {
    if (!item.id) return item.text;

    let badge = "Nuevo";
    if (item.partida === 0) badge = "Producto";
    if (item.partida === 1 && !item.newTag) badge = "Servicio";

    return $("<span>")
      .text(item.text + " ")
      .append($('<small class="text-muted">').text("(" + badge + ")"));
  },
  templateSelection: function (item) {
    return item.text;
  },
});

$("#materialID").on("select2:select", function (e) {
  let data = e.params.data;

  // Asegurar que la opción tenga el atributo data-partida
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

  // Obtener el precio del material
  if (!data.newTag) {
    // No obtener precio para nuevos tags sin guardar
    $.ajax({
      url: endpoints.materialesObtener,
      method: "GET",
      data: { id: data.id },
      dataType: "json",
      success: function (response) {
        if (response.success && response.data) {
          $("#precioUnitario").val(response.data.precio.toFixed(2));
          // Guardar datos del material en data-attributes para usar después
          $("#materialID").data("material-info", {
            id: data.id,
            nombre: response.data.nombre,
            imagen: response.data.imagen,
            precio: response.data.precio,
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
        icon: "error",
      });
      return;
    }
    if (!cantidad || cantidad <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe ingresar una cantidad válida",
        icon: "error",
      });
      return;
    }
    if (isNaN(precioUnitario) || precioUnitario < 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe ingresar un precio unitario válido",
        icon: "error",
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
      partida: materialInfo.partida,
    };

    partidasArray.push(partida);

    let imageHtml = partida.imagen
      ? `<img src="${adminPath}administrador/uploads/productos/${partida.imagen}" alt="${partida.nombre}" width="50">`
      : '<span class="text-muted">N/A</span>';
    let deleteBtn = `<button type="button" class="btn btn-sm btn-danger btn-delete-partida" data-id="${partida.id}"><i class="fas fa-trash"></i></button>`;

    let $tbody = $("#tabPartidas tbody");
    $tbody.append(`
            <tr data-partida-id="${partida.id}">
                <td>${partida.id}</td>
                <td>${imageHtml}</td>
                <td>${partida.nombre}</td>
                <td>${partida.cantidad}</td>
                <td>$ ${partida.precioUnitario.toFixed(2)}</td>
                <td>$ ${partida.importe.toFixed(2)}</td>
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
        data: { nombre: item.text, precio: $('#precioUnitario').val() || 0 },
        dataType: "json",
      });
    });

    $.when
      .apply($, requests)
      .done(function () {
        let responses = arguments;
        if (newItems.length === 1) {
          responses = [arguments];
        }
        for (let i = 0; i < responses.length; i++) {
          let resp = responses[i][0];
          if (resp && resp.success && resp.data) {
            let created = resp.data;
            let current = $select.val();

            if (Array.isArray(current)) {
              current = current.map(function (v) {
                return v === newItems[i].id ? created.id : v;
              });
            } else if (current === newItems[i].id) {
              current = created.id;
            }

            $select.val(current).trigger("change");
            $select.data("material-info", {
              id: created.id,
              nombre: newItems[i].text,
              imagen: null,
              precio: parseFloat($("#precioUnitario").val()) || 0,
              partida: 1,
            });
          }
        }
        addPartidaToTable();
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

// Eliminar partida de la tabla
$(document).on("click", ".btn-delete-partida", function () {
  let id = $(this).data("id");

  // Eliminar del array
  partidasArray = partidasArray.filter(function (p) {
    return p.id !== id;
  });

  // Eliminar de la tabla
  $(`#tabPartidas tbody tr[data-partida-id="${id}"]`).remove();

  // Actualizar totales
  updateTotals();
});

$("#iva").on("change", function () {
  updateTotals();
});

$("#descuento").on("input", function () {
  updateTotals();
});

function updateTotals() {
  let subtotal = 0;

  partidasArray.forEach(function (p) {
    subtotal += p.importe;
  });
  let ivaValue = parseInt($("#iva").val());
  let ivaPercent = 0;

  if (ivaValue === 1) {
    ivaPercent = 0.16;
  } else {
    ivaPercent = 0;
  }
  let iva = subtotal * ivaPercent;
  let descuentoValue = parseFloat($("#descuento").val()) || 0;
  let descuento = subtotal * (descuentoValue / 100);

  let total = subtotal + iva - descuento;

  $(".subtotal").text("$ " + subtotal.toFixed(2));
  $(".iva").text("$ " + iva.toFixed(2));
  $(".descuento").text("$ " + descuento.toFixed(2));
  $(".grantotal").text("$ " + total.toFixed(2));
}

$("#btnGuardar").on("click", function (e) {
  e.preventDefault();
  if (partidasArray.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe agregar al menos una partida antes de guardar la cotización.",
    });
    return;
  }

  // Preparar datos del cliente
  let clienteData = $("#clienteID").select2("data") || [];
  clienteData = clienteData[0] || null;
  let clienteID = $("#clienteID").val() || "";
  let clienteNewName = null;
  if (clienteData && clienteData.newTag) {
    clienteNewName = clienteData.text;
  }

  if (!clienteID && !clienteNewName) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe seleccionar un cliente antes de guardar la cotización.",
    });
    return;
  }

  const submitCotizacion = function (finalClienteId) {
    let payload = {
      clienteID: finalClienteId,
      iva: $("#iva").val(),
      validez: $("#validez").val(),
      tipoVenta: $("#tipoVenta").val(),
      diasCredito: $("#diasCredito").val(),
      descuento: $("#descuento").val(),
      anticipo: $("#anticipo").val(),
      detalles: $("#detalles").val(),
      partidas: JSON.stringify(partidasArray),
    };

    $.ajax({
      url: endpoints.cotizacionCreate,
      method: "POST",
      data: payload,
      dataType: "json",
    })
      .done(function (resp) {
        if (resp && resp.success) {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text:
              "Cotización guardada correctamente (Folio: SP# " +
              resp.cotizacion_id +
              ").",
          }).then(function () {
            window.location.href = "cotizaciones";
          });
          // // Opcional: redirigir a la vista de cotizaciones
          window.location.href = "cotizaciones";
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al guardar la cotización: " + (resp.message || ""),
          });
        }
      })
      .fail(function (xhr) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error en el servidor al guardar la cotización.",
        });
      });
  };

  if (clienteNewName) {
    $.ajax({
      url: endpoints.clientesList,
      method: "POST",
      data: { nombre: clienteNewName },
      dataType: "json",
    })
      .done(function (resp) {
        if (resp && resp.success && resp.data && resp.data.id) {
          submitCotizacion(resp.data.id);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo verificar o crear el cliente.",
          });
        }
      })
      .fail(function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al verificar o crear el cliente.",
        });
      });
  } else {
    submitCotizacion(clienteID);
  }
});
