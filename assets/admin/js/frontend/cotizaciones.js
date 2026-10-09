const adminPath = window.location.pathname;
const adminSearch = window.location.search;
const usesRouteQuery = /[?&]route=/.test(adminSearch);
const basePath = usesRouteQuery
  ? adminPath
  : adminPath.replace(/\/cotizaciones\/?$/, "");
const routeSeparator = usesRouteQuery ? "?route=" : "/";

const endpoint = (routeName) => `${basePath}${routeSeparator}${routeName}`;
const endpoints = {
    cotizaciones:endpoint('cotizaciones/list')
};

const statusBadgeClass = {
    '0': 'info',
    '1': 'danger',
    '2': 'dark',
    '3': 'primary',
    '4': 'success',
    '5': 'danger',
    '6': 'warning',
    '7': 'light'
};

$('#tabCotizaciones').DataTable({
    language: TableLanguaje,
    ordering:false,
    lengthChange: false,
    pageLength: 20,
    ajax: {
    url: endpoints.cotizaciones,
    type: "GET",
    dataType: "json",
    dataSrc: function (json) {
      console.log("Respuesta del servidor: ", json);
      if (!json.success || !Array.isArray(json.data)) {
        return [];
      }
      return json.data;
    },
    error: function (xhr, error, thrown) {
      console.error("Error en la carga de cotizaciones: ", error);
    },
  },
  columns: [
    { data: "Folio", render: function(data, type, row) {
        return data + '#' + row.id;
      }
    },
    { data: "fecha", render: formatFecha },
    { data: "cliente"},
    {
      data: "total"},
     { data: "observaciones", defaultContent: "<i>Sin observaciones</i>" },
    {
      data: "estado",
      render: function(data, type, row) {
        const badgeClass = statusBadgeClass[row.status_id] || 'secondary';
        return `<span class="badge light bg-${badgeClass}">${data}</span>`;
      }
    },
    {
      data: "acciones",
      className: "text-center",
      defaultContent: ""      
    }, // Columnas de botones no se ordenan ni buscan
  ],

  deferRender: true,
});

