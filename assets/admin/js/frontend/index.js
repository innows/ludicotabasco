const adminBasePath = window.location.pathname.replace(/\/index.*$/, '');
const endpoints = {
    cotizaciones: adminBasePath + '/cotizaciones/list'
};

// Cargar cotizaciones
function cargarCotizaciones() {
    $.ajax({
        url: endpoints.cotizaciones,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            const tbody = $('#tabCotizaciones tbody');
            tbody.empty();

            if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
                tbody.append(`
                    <tr>
                        <td colspan="7" class="text-center">No hay cotizaciones disponibles.</td>
                    </tr>
                `);
                return;
            }

            response.data.forEach(function(cotizacion) {
                tbody.append(`
                    <tr>
                        <td>${cotizacion.id}</td>
                        <td>${cotizacion.fecha}</td>
                        <td>${cotizacion.cliente}</td>
                        <td>${cotizacion.total}</td>
                        <td>${cotizacion.observaciones}</td>
                        <td>${cotizacion.estado}</td>
                        <td>${cotizacion.acciones}</td>
                    </tr>
                `);
            });
        },
        error: function() {
            const tbody = $('#tabCotizaciones tbody');
            tbody.empty();
            tbody.append(`
                <tr>
                    <td colspan="7" class="text-center text-danger">Error al cargar las cotizaciones.</td>
                </tr>
            `);
        }
    });
}

// Inicializar
$(document).ready(function() {
    cargarCotizaciones();
});


