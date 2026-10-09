const adminPath = window.location.pathname;
const adminSearch = window.location.search;
const usesRouteQuery = /[?&]route=/.test(adminSearch);
const basePath = usesRouteQuery
  ? adminPath
  : adminPath.replace(/\/newrecibo\/?$/, "");
const routeSeparator = usesRouteQuery ? "?route=" : "/";

const endpoint = (routeName) => `${basePath}${routeSeparator}${routeName}`;
const endpoints = {
  clientesList: endpoint("clientes/list"),
  serviciosList: endpoint("servicios/list"),
  materialesList: endpoint("materiales/list"),
  serviciosGuardar: endpoint("servicios/guardar"),
  materialesObtener: endpoint("materiales/obtener"),
  recibosGuardar: endpoint("recibos/crear"),
  buscarCotizaciones: endpoint("recibos/BuscarCotizaciones"),
  PartidasCotizacion: endpoint("recibos/PartidasCotizacion"),
};

const clienteSelect = $("#clienteID");
const servicioSelect = $("#Servicio_ID");
const materialSelect = $("#Material_ID");
const cotizacionSelect = $("#Cotizacion_ID");
const cboiva = $("#aplicaIVA");
const descuento =$("#Total_descuento");
let partidasArray = [];
let partidaCounter = 1;

cotizacionSelect.select2({
  placeholder: "- Seleccionar -",
  allowClear: true,
  width: "100%",
});

clienteSelect.select2({
  placeholder: "Seleccionar cliente",
  allowClear: true,
  width: "100%",
  tags: true,
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

clienteSelect.on("change", function (e) {
  const clienteID = $(this).val();

  if (clienteID && !clienteID.startsWith("new_")) {
    BuscarCotizaciones(clienteID);
  } else {
    cotizacionSelect.prop("disabled", true);
    cotizacionSelect.selectpicker("refresh");
  }
});

cotizacionSelect.on("change", function () {
  const cotizacionID = $(this).val();
  const aplicaIva = $(this).find("option:selected").attr("data-iva");
  if (typeof aplicaIva !== "undefined") {
    cboiva.selectpicker("val", String(aplicaIva));
  }
  if (cotizacionID) {
    $(".aplicaIVA").addClass("disabled");
    $(".aplicaIVA button").prop("disabled", true);
    ObtnerPartidasCotizacion(cotizacionID);
  } else {
    $(".aplicaIVA").closest(".bootstrap-select").find("button").prop("disabled", false);
    $("#tabPartidas tbody").empty();
  }
});

function BuscarCotizaciones(clienteID) {
  $.ajax({
    url: endpoints.buscarCotizaciones + "&clienteID=" + clienteID,
    type: "GET",
    dataType: "json",
    success: function (resp) {
      const formGroup = cotizacionSelect.closest(".form-group");
      const data = resp.data || [];

      cotizacionSelect.empty().val(null).trigger("change");

      if (Array.isArray(data) && data.length > 0) {
        formGroup.prop("disabled", false);
        $("#frmPartidas").hide();
        data.forEach((item) => {
          const option = new Option(item.text, item.id, false, false);
          descuento.val(item.Total_Descuento);
          $(option).attr("data-iva", item.Aplica_IVA);
          cotizacionSelect.append(option);
        });

        cboiva.selectpicker("val", String(data[0].Aplica_IVA));
        cotizacionSelect.val(data[0].id).trigger("change");
      } else {
        cotizacionSelect.append(
          new Option("- No hay cotizaciones disponibles -", "", false, false),
        );
        formGroup.prop("disabled", false);
        $("#frmPartidas").show();
        $("#tabPartidas tbody").empty();
      }
    },

    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}

function ObtnerPartidasCotizacion(cotizacionID) {
  $.ajax({
    url: `${endpoints.PartidasCotizacion}&cotizacionID=${cotizacionID}`,
    type: "GET",
    dataType: "json",
    success: function (resp) {
      const data = resp || [];
      const $tbody = $("#tabPartidas tbody");

      $tbody.empty();

      // Helper para formateo de moneda (Estilo Inversión)
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(amount);
      };

      if (Array.isArray(data) && data.length > 0) {
        let totalSubtotal = 0;
        const rows = [];

        data.forEach((item, index) => {
          const cantidad = parseFloat(item.Cantidad) || 0;
          const precioUnitario = parseFloat(item.Precio_Unitario) || 0;
          const partidaTotal = item.Total
            ? parseFloat(item.Total)
            : precioUnitario * cantidad;

          totalSubtotal += partidaTotal;

          rows.push(`
            <tr>
              <td style="text-align: center">${index + 1}</td>
              <td>${item.nombre}</td>
              <td style="text-align: center">${cantidad}</td>
              <td>${formatCurrency(precioUnitario)}</td>
              <td>${formatCurrency(partidaTotal)}</td>
            </tr>
          `);
        });

        $tbody.append(rows.join(""));

        const tasaIVA = 0.16;
        const aplicaIVA = cboiva.val(); // cboiva.val(null).trigger("change");

   
        const montoDescuento = (descuento.val()) || 0;
        const baseTotal = Math.max(0, totalSubtotal - montoDescuento);
        const totalIVA = aplicaIVA === "0" ? 0 : baseTotal * tasaIVA;
         
        

        const totalGeneral = baseTotal + totalIVA;
      
        $(".subtotal").text(formatCurrency(totalSubtotal));
        $(".iva").text(formatCurrency(totalIVA));
        $(".descuento").text(formatCurrency(descuento.val()));
        $(".total").text(formatCurrency(totalGeneral));

    
        $("#Total_original").val(parseFloat(totalGeneral));

      } else {
        $tbody.append(
          '<tr><td colspan="5" class="text-center">No hay partidas disponibles</td></tr>',
        );

        // Resetear totales si no hay datos
        $(".subtotal, .iva, .total").text(formatCurrency(0));
      }
    },
    error: function (xhr, status, error) {
      console.error(
        `[Error de Red]: No se pudieron obtener las partidas. Detalle: ${error}`,
      );
    },
  });
}
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

  // Función para agregar partida a la tabla
  let addPartidaToTable = function () {
    let materialId = $select.val();
    let cantidad = parseFloat($("#cantidad").val());
    let precioUnitario = parseFloat($("#precioUnitario").val());

    // Validar datos
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

    // Crear objeto de partida
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

    // Agregar a array
    partidasArray.push(partida);

    // Agregar fila a tabla

    let deleteBtn = `<button type="button" class="btn btn-sm btn-danger btn-delete-partida" data-id="${partida.id}"><i class="fas fa-trash"></i></button>`;

    let $tbody = $("#tabPartidas tbody");
    $tbody.append(`
            <tr data-partida-id="${partida.id}" data-material-id="${partida.materialId}" data-tipo-partida="${partida.partida}">
                <td>${partida.id}</td>

                <td>${partida.nombre}</td>
                <td>${partida.cantidad}</td>
                <td>$ ${partida.precioUnitario.toFixed(2)}</td>
                <td>$ ${partida.importe.toFixed(2)}</td>
                <td>${deleteBtn}</td>
            </tr>
        `);

    // Incrementar contador
    partidaCounter++;

    // Actualizar totales
    updateTotals();

    // Limpiar formulario
    $select.val(null).trigger("change");
    $("#cantidad").val("");
    $("#precioUnitario").val("");
    $select.focus();
  };

  // Si hay nuevos items, guardarlos primero
  if (newItems.length > 0) {
    let requests = newItems.map(function (item) {
      return $.ajax({
        url: endpoints.serviciosGuardar,
        method: "POST",
        data: { nombre: item.text },
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

        // Reemplazar IDs temporales por creados
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

        // Luego agregar la partida
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
    // No hay nuevos items, agregar partida directamente
    addPartidaToTable();
  }
});

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

$("#aplicaIVA").on("change", function () {
  updateTotals();
});

function updateTotals() {
  let subtotal = 0;

  partidasArray.forEach(function (p) {
    subtotal += p.importe;
  });
  let ivaValue = parseInt($("#aplicaIVA").val());
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
  $("#Total_original").val(total.toFixed(2));

  $(".subtotal").text("$ " + subtotal.toFixed(2));
  $(".iva").text("$ " + iva.toFixed(2));
  $(".total").text("$ " + total.toFixed(2));
}

$("#btnGuardar").on("click", function () {


  const clienteID = clienteSelect.val();
  const cotizacionID = cotizacionSelect.val() || 0;
  const montoPagado = parseFloat($("#Monto_Pagado").val()) || 0;
  const notaRecibo = $("#Nota_Recibo").val();
  const aplicaIVA = cboiva.val();
  const totalOriginal = parseFloat($("#Total_original").val()) || 0;
  const totalDescuento = descuento.val() ? parseFloat(descuento.val()) : 0;
  

 

  const frmCotizacion = $("#frmCotizaciones");
  const selectedCotizacion =
    cotizacionID && cotizacionID !== "-1" ? cotizacionID : null;

  if (!clienteID) {
    swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor, selecciona un cliente.",
    });
    return;
  }

  if (
    selectedCotizacion &&
    !selectedCotizacion.startsWith("new_") &&
    montoPagado > totalOriginal
  ) {
    swal.fire({
      icon: "error",
      title: "Error",
      text: "El monto pagado no puede ser mayor al total de la cotización.",
    });
    return;
  }

  if (montoPagado <= 0) {
    swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor, ingresa una cantidad válida para el monto pagado.",
    });
    return;
  }

   if($('#metodoPago').val() === '0'){
    swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor, selecciona un método de pago.",
    });
    return;
  }

  let payload = {};
  frmCotizacion.serializeArray().forEach(function (field) {
    payload[field.name] = field.value;
  });

  payload.Nota_Recibo = notaRecibo;
  payload.aplicaIVA = aplicaIVA;
  payload.Total_original = totalOriginal;
  payload.Total_Descuento = totalDescuento;

  // Si el cliente es un tag nuevo (id con prefijo new_), enviar también el nombre real
  if (clienteID && String(clienteID).startsWith("new_")) {
    const selData = clienteSelect.select2("data")[0];
    payload.clienteNewName = selData && selData.text
      ? selData.text
      : String(clienteID).replace(/^new_/, "").replace(/_/g, " ");
  }

  if (selectedCotizacion) {
    payload.Cotizacion_ID = selectedCotizacion;
    
  } else {
    if (partidasArray.length === 0) {
      $("#tabPartidas tbody tr").each(function () {
        const $tr = $(this);
        partidasArray.push({
          Producto_ID: $tr.data("material-id") || $tr.data("partida-id"),
          Cantidad: parseFloat($tr.find("td").eq(3).text()) || 0,
          Precio_Unitario:
            parseFloat($tr.find("td").eq(4).text().replace("$", "").trim()) ||
            0,
          Subtotal:
            parseFloat($tr.find("td").eq(5).text().replace("$", "").trim()) ||
            0,
          Tipo_Partida: $tr.data("tipo-partida") || 0,
        });
      });
    }

    payload.partidas = JSON.stringify(
      partidasArray.map(function (partida) {
        var rawId = partida.materialId || partida.Producto_ID || "0";
        var IdP = parseInt(String(rawId).replace(/[^0-9]/g, ""), 10) || 0;
        return {
          Producto_ID: IdP,
          Cantidad: partida.cantidad || partida.Cantidad || 0,
          Precio_Unitario:
            partida.precioUnitario || partida.Precio_Unitario || 0,
          Subtotal: partida.importe || partida.Subtotal || 0,
          Tipo_Partida:
            typeof partida.partida !== "undefined"
              ? partida.partida
              : partida.Tipo_Partida || 0,
        };
      }),
    );
  }

  $.ajax({
    url: `${endpoints.recibosGuardar}`,
    method: "POST",
    data: payload,
    success: function (response) {
      swal.fire({
        icon: "success",
        title: "Éxito",
        text: "El recibo ha sido creado correctamente.",
      });
     
      window.location.href = `${basePath}${routeSeparator}recibos`;
    },
    error: function (xhr, status, error) {
      console.error(`Detalle: ${error}`);
      swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Ocurrió un error al crear el recibo.",
      });
    },
  });
});
