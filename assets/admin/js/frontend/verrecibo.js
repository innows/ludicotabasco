const adminPath = window.location.pathname;
const adminSearch = window.location.search;
const usesRouteQuery = /[?&]route=/.test(adminSearch);

const basePath = usesRouteQuery
  ? adminPath
  : adminPath.replace(/\/recibos(\/.*)?$/, "/recibos");
const routeSeparator = usesRouteQuery ? "/?route=" : "/";

const endpoint = (routeName) => `${basePath}${routeSeparator}${routeName}`;
const endpoints = {
  PartidasRecibo: endpoint("Partidas"),
};

const reciboID = $("#reciboID").val();

function obtenerPartidasRecibo(reciboID) {
  $.ajax({
    url: `${endpoints.PartidasRecibo}&reciboID=${reciboID}`,
    type: "GET",
    dataType: "json",
    success: function (resp) {
      const data = resp || [];
      const $tbody = $("#tabPartidas tbody");

      $tbody.empty();

      // Helper para formateo de moneda (Estilo Inversión)
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
      };

      if (Array.isArray(data) && data.length > 0) {
        let totalSubtotal = 0;
        const rows = [];

        data.forEach((item, index) => {
          // Validar que los campos sean numéricos para evitar NaN
          const cantidad = parseFloat(item.Cantidad) || 0;
          const precioUnitario = parseFloat(item.Precio_Unitario) || 0;

          // El total de la partida debería venir calculado o calcularse de forma estricta
          const partidaTotal = item.Subtotal ? parseFloat(item.Subtotal) : (precioUnitario * cantidad);

          totalSubtotal += partidaTotal;

          // Construcción de la fila (Corrección de text-align y uso de index nativo)
          rows.push(`
            <tr>
              <td style="text-align: center">${index + 1}</td>
              <td>${item.nombre}</td>
              <td style="text-align: center">${cantidad}</td>
              <td  style="text-align: center">${formatCurrency(precioUnitario)}</td>
              <td>${formatCurrency(partidaTotal)}</td>
            </tr>
          `);
        });

        $tbody.append(rows.join(''));
        const tasaIVA = 0.16; // Ajusta según tu región
        const aplicaIVA = $('#aplicaIVA').val();
        
     

        const totalIVA = (aplicaIVA === "0") ? 0 : (totalSubtotal * tasaIVA);
        const totalGeneral = totalSubtotal + totalIVA;

        $('.subtotal').text(formatCurrency(totalSubtotal));
        $('.iva').text(formatCurrency(totalIVA));
       // $('.total').text(formatCurrency(totalGeneral));

      } else {
        $tbody.append('<tr><td colspan="5" class="text-center">No hay partidas disponibles</td></tr>');
        $('.subtotal, .iva').text(formatCurrency(0));
      }
    },
    error: function (xhr, status, error) {
      console.error(`[Error de Red]: No se pudieron obtener las partidas. Detalle: ${error}`);
    }
  });
}

obtenerPartidasRecibo(reciboID);

$(".generatePdfBtn").on("click", function () {

  const reciboId = $(this).data("recibo-id");
  const pagoId = $(this).data("pago-id") || "0";
  const recibo = $(this).data("esrecibo") ?? 0;
  const pdfUrl = `${basePath}${routeSeparator}generarpdf/id=${reciboId}&pago=${pagoId}&imprimir_nota=${recibo}`;

  $("#pdfPreview").attr("src", pdfUrl);
  $("#DocModal").modal("show");

});
