const cotizacionId = $("#cotizacionID").val() || 0;
const adminBasePath = window.location.pathname.replace(/\/viewcotizacion.*$/, '').replace(/\/+$/, '');


$('.estado').on('click', function(e) {
    
    e.preventDefault();
   const  estadoTitle = $(this).data('title');
   const  estadoID = $(this).data('status');

    if (!cotizacionId) {
        swal.fire({
            title: 'Error',
            text: 'ID de cotización no encontrado.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    swal.fire({
        title: '¿Estás seguro?',
        html: '¿Deseas actualizar a <strong>' + estadoTitle + '</strong> esta cotización?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, ' + estadoTitle.toLowerCase(),
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
             autorizarCotizacion(estadoID, estadoTitle);
        }
    });
});

function autorizarCotizacion(estadoID, estadoTitle) {    
    $.ajax({
        url: `${adminBasePath}/cotizaciones/autorizar/id=${cotizacionId}?estadoID=${estadoID}`,
        method: 'POST',
        processData: true,
        contentType: 'application/json',        
        data: JSON.stringify({ estadoID: estadoID }),
        success: function(response) {
            swal.fire({
                title: 'Éxito',
                html: 'Cotización <strong>' + estadoTitle + '</strong> exitosamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                location.reload();
            });
        },
        error: function() {
            swal.fire({
                title: 'Error',
                html: 'Error al ' + estadoTitle.toLowerCase() + ' la cotización. Por favor, intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}

$('#pdfTemplate').on('change', function() {
    const selectedTemplate = $(this).val();
    $('#generatePdfBtn').prop('disabled', !selectedTemplate);
});

$('#generatePdfBtn').on('click', function() {
    const selectedTemplate = $('#pdfTemplate').val();

    if (!selectedTemplate) {
        swal.fire({
            title: 'Error',
            text: 'Por favor, selecciona una plantilla para generar el PDF.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    $.ajax({
        url: `${adminBasePath}/cotizaciones/generarpdf/id=${cotizacionId}?template=${selectedTemplate}`,
        method: 'GET',        
        xhrFields: {
            responseType: 'blob'
        },
        success: function(blob) {
            const url = URL.createObjectURL(blob);
            $('#pdfPreview').attr('src', url);
            $('#pdfPreviewContainer').show();
        },
        error: function() {
            swal.fire({
                title: 'Error',
                text: 'Error al generar el PDF. Por favor, intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    });

   
});