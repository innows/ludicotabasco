const adminPath = window.location.pathname;
const adminSearch = window.location.search;
const usesRouteQuery = /[?&]route=/.test(adminSearch);
const basePath = usesRouteQuery
  ? adminPath
  : adminPath.replace(/\/recibos\/?$/, "");
const routeSeparator = usesRouteQuery ? "?route=" : "/";

const endpoint = (routeName) => `${basePath}${routeSeparator}${routeName}`;
const endpoints = {
  recibosList: endpoint("recibos/list"),
};

const tabRecibos = $("#tabRecibos").DataTable({
  language: TableLanguaje,
  ordering: false,
  lengthChange: false,
  ajax: {
    url: endpoints.recibosList,
    type: "GET",
    dataType: "json",
    dataSrc: function (json) {
      if (!json.success || !Array.isArray(json.data)) {
        return [];
      }
      return json.data;
     
    },
    error: function (xhr, error, thrown) {
      console.error("Error en la carga de recibos: ", error);
    },
  },

  columns: [
    { data: "Folio", defaultContent: "" },
    { data: "Fecha", render: formatFecha, defaultContent: "" },
    { data: "Cliente", defaultContent: "" },
    {
      data: "Total_original",
      render: formatMoneda,
      defaultContent: "0.00",
    },
    { data: "Saldo_pendiente", render: formatMoneda, defaultContent: "0.00" },
    {
      data: "Estatus",
      render: function (data) {
        return `<span class="badge light  badge-${data === "Pagado" ? "success" : "warning"}">${data}</span>`;
      },
    },
    {
      targets: 6,
      className: "text-start",
      render: function (_d, _t, row) {
        if (row.Estatus_ID === 1) {
          return `
                <button class="btn btn-sm btn-primary btn-registrar-pago" data-id="${row.Recibo_ID}" data-saldo="${row.Saldo_pendiente}" data-bs-toggle="modal" data-bs-target="#notarecibo" title="Registrar Pago"><i class="fas fa-money-bill"></i></button>  
                <a href="${basePath}${routeSeparator}recibos/obtener?rec=${row.Recibo_ID}" class="btn btn-sm btn-dark" title="Ver Recibo"><i class="fas fa-eye"></i></a>
                  `;
        }
        else{
          return `<a href="${basePath}${routeSeparator}recibos/obtener?rec=${row.Recibo_ID}" class="btn btn-sm btn-dark" title="Ver Recibo"><i class="fas fa-eye"></i></a>`;
        }
      },
    },
  ],

  deferRender: true,
  pageLength: 10,
});



$("#tabRecibos").on("click", ".btn-registrar-pago", function () {
  const idrecibo = $(this).data("id");
  const saldoPendiente = $(this).data("saldo");
  $("#idrecibo").val(idrecibo);
  $("#saldo_pendiente").val(saldoPendiente);
});

$("#btnRegistrarPago").on("click", function () {
  const frmPago = $("#frmPago");
  const formData = frmPago.serializeArray().reduce((acc, field) => {
    acc[field.name] = field.value;
    return acc;
  }, {});

  if (!formData.Monto_Pagado) {
    Swal.fire("Error", "Por favor ingrese un monto válido para el pago.", "error");
    return;
  }

  if (!formData.metodoPago || parseInt(formData.metodoPago) <= 0) {
    Swal.fire("Error", "Por favor seleccione un método de pago.", "error");
    return;
  }

  $.ajax({
    url: `${basePath}${routeSeparator}recibos/registrarPago`,
    type: "POST",
    data: formData,
    dataType: "json",
    success: function (response) {
      if (response.success) {
        Swal.fire("Éxito", "Pago registrado correctamente.", "success");
        frmPago[0].reset();
        $("#notarecibo").modal("hide");
        tabRecibos.ajax.reload();
      } else {
        Swal.fire("Error", response.error || response.message || "No se pudo registrar el pago.", "error");
      }
    },
    error: function (xhr, status, error) {
      console.error("Error en la solicitud AJAX: ", error);
      const response = xhr.responseJSON || {};
      Swal.fire("Error", response.error || response.message || "Ocurrió un error al registrar el pago.", "error");
    },
  });
});


