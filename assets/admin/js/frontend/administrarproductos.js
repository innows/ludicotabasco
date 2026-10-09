Dropzone.autoDiscover = false;
let galeriaDropzone;
let serviciosSeleccionados = [];


const endpoints = {
    servicios: '/servicios/list',
    productos: 'admonproductos/list',
    eliminar: 'admonproductos/eliminar'
};

$('#tabProductos').DataTable({
    ordering:false,
    processing: true,
    lengthChange: false,
    pageLength: 30,
    dom: 'frtip',
	buttons: false,
    'language': {
        'url': '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json',
        paginate: {
						next: '<i class="fa-solid fa-angle-right"></i>',
						previous: '<i class="fa-solid fa-angle-left"></i>' 
		    }
    },
    ajax: {
        url: endpoints.productos,
        type: 'GET',
        dataType: 'json',
        data:{
            start:0,
            length: 1000
        }
    },
    columns: [
        { data: 'id' },
        { data: 'sku' },
        { data: 'nombre' },
        { data: 'precio', render: function(data) {
            return '$' + data;
        } },
        { data: 'categoria' },
        { data: 'estado', render: function(data) {
            return data ? '<span class="badge light badge-success">Activo</span>' : '<span class="badge light badge-danger">Inactivo</span>';
        }
        },
        { data: 'stock' },
        { data: null, render: function(data) {
            return `
                <a href="admonproductos/perfil/${data.id}" class="btn-icon" title="Ver perfil" data-bs-toggle="tooltip">
                    <span class="btn btn-sm btn-primary"> <i class="fas fa-edit"></i></span>
                </a>
                <a type="button" class="btn-icon btn-delete btn_eliminar" title="Eliminar" data-id="${data.id}" data-bs-toggle="tooltip">
                    <span class="btn btn-sm btn-danger"> <i class="fas fa-trash"></i></span>
                </a>
            `;
        }
        }
    ]
});

$('#categoria_id').select2({
    dropdownParent: $('#modProductos'), // ID del modal
    placeholder: 'Seleccionar categoría',
    allowClear: true,
    width: '100%'
});

$('#servicio_id').select2({
    dropdownParent: $('#modProductos'), // ID del modal
    placeholder: 'Seleccionar servicio',
    allowClear: true,
    width: '100%',
    tags: true, // Permite crear nuevos registros
    createTag: function(params) {
        let term = $.trim(params.term);
        if (term === '') {
            return null;
        }
        return {
            id:term.replace(/\s+/g, '_').toLowerCase(), // Generar ID único para nuevos servicios
            text: term,
            newTag: true
        };

    },
    ajax: {
        url: endpoints.servicios,
        dataType: 'json',
        delay: 250,
        processResults: function(data) {
            return {
                results: data.data.map(function(serv) {
                    return {
                        id: serv.Servicio_ID,
                        text: serv.Nombre_Servicio
                    };
                })
            };
        },
        cache: true
    }
});

// Agregar servicio a la tabla
$('#servicio_id').on('select2:select', function(e) {
    const data = e.params.data;
    const servicioId = data.id;
    const servicioText = data.text;
    const isNew = data.newTag || false;

    // Verificar si ya está en la lista
    if (serviciosSeleccionados.some(s => s.id === servicioId && s.new === isNew)) {
        Swal.fire({
            icon: 'warning',
            title: 'Servicio ya agregado',
            text: 'Este servicio ya está en la lista.'
        });
        $(this).val(null).trigger('change');
        return;
    }

    serviciosSeleccionados.push({
        id: servicioId,
        text: servicioText,
        new: isNew
    });

    renderServiciosTable();
    $(this).val(null).trigger('change');
});

// Renderizar tabla de servicios
function renderServiciosTable() {
    const tbody = $('#tabServicios tbody');
    tbody.empty();
    serviciosSeleccionados.forEach((servicio, index) => {
        tbody.append(`
            <tr>
                <td>${servicio.text}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger" onclick="removerServicio(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

// Remover servicio
function removerServicio(index) {
    serviciosSeleccionados.splice(index, 1);
    renderServiciosTable();
}

function initializeGaleriaDropzone() {
    if (galeriaDropzone) {
        galeriaDropzone.destroy();
    }

    galeriaDropzone = new Dropzone('#dropzoneArea', {
        url: '#',
        autoProcessQueue: false,
        uploadMultiple: false,
        maxFiles: 10, // Permitir hasta 10 imágenes
        maxFilesize: 1024, // Máximo 1GB por archivo
        acceptedFiles: 'image/*',
        addRemoveLinks: true,
        dictDefaultMessage: 'Arrastra las imágenes o haz clic aquí para seleccionarlas',
        dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}GB). Máximo: {{maxFilesize}}GB.',
        init: function () {
            // Permitir múltiples archivos
        }
    });
}
function cargarProductos() {
    $.ajax({
        url: endpoints.productos,
        type: 'GET',
        dataType: 'json',
        data:{
            start:0,
            length: 1000
        },
        success: function(response) {
            const tbody = $('#tabProductos tbody');
            tbody.empty();

            if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
                tbody.append(`
                    <tr>
                        <td colspan="7" class="text-center">No hay productos disponibles.</td>
                    </tr>
                `);
                return;
            }

            response.data.forEach(function(producto) {

                tbody.append(`
                    <tr>
                        <td>${producto.id}</td>
                        <td>${producto.sku}</td>
                        <td>${producto.nombre.slice(0, 70)}</td>
                        <td>$${producto.precio}</td>
                        <td>${producto.categoria || ''}</td>
                        <td>${producto.estado ? '<span class="badge badge-light">Activo</span>' : '<span class="badge badge-danger">Inactivo</span>'}</td>
                        <td>${producto.stock}</td>
                        <td>
                            <a href="${adminBasePath}/admonproductos/perfil/${producto.id}" class="btn-icon" title="Ver perfil" data-bs-toggle="tooltip">
                              <span class="btn btn-sm btn-primary"> <i class="fas fa-edit"></i></span>
                            </a>
                            <a type="button" class="btn-icon btn-delete btn_eliminar" title="Eliminar" data-id="${producto.id}" data-bs-toggle="tooltip">
                            <span class="btn btn-sm btn-danger"> <i class="fas fa-trash"></i></span>
                            </a>
                        </td>
                    </tr>
                `);
            });
        },
        error: function() {
            const tbody = $('#tabProductos tbody');
            tbody.empty();
            tbody.append(`
                <tr>
                    <td colspan="7" class="text-center text-danger">Error al cargar los productos.</td>
                </tr>
            `);
        }
    });
}

$(document).on('click', '.btn-delete', function() {
    const productoId = $(this).data('id');
    if (!productoId) {
        return;
    }

    Swal.fire({
        title: '¿Eliminar producto?',
        text: 'Esta acción cambiará el estado del producto a inactivo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: endpoints.eliminar,
                type: 'POST',
                data: { id: productoId },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: response.message || 'Producto eliminado correctamente'
                        });
                        cargarProductos();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: response.message || 'No se pudo eliminar el producto'
                        });
                    }
                },
                error: function(xhr) {
                    let mensaje = 'Error en la petición al servidor';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        mensaje = xhr.responseJSON.message;
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: mensaje
                    });
                }
            });
        }
    });
});

// Guardar producto
function guardarProducto() {
    const formData = new FormData($('#frmProducto')[0]);

    // Agregar servicios seleccionados
    formData.append('servicios', JSON.stringify(serviciosSeleccionados));

    // Agregar archivos de galería
    if (galeriaDropzone && galeriaDropzone.files.length > 0) {
        galeriaDropzone.files.forEach(file => {
            formData.append('img_galeria[]', file);
        });
    }

    // Enviar
    $.ajax({
        url:  '/admonproductos/nuevo',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                $('#modProductos').modal('hide');
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: response.message || 'Producto guardado correctamente'
                });
                cargarProductos();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al guardar el producto'
                });
            }
        },
        error: function() {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la petición al servidor'
            });
        }
    });
}

// Reset modal
function resetProductoModal() {
    $('#frmProducto')[0].reset();
    serviciosSeleccionados = [];
    renderServiciosTable();
    if (galeriaDropzone) {
        galeriaDropzone.removeAllFiles(true);
    }
    $('#servicio_id').val(null).trigger('change');
}

$(document).ready(function () {
    initializeGaleriaDropzone();

    // Abrir modal nuevo
    $('[data-bs-toggle="modal"][data-bs-target="#modProductos"]').on('click', function() {
        resetProductoModal();
        $('#modProductos .modal-title').text('Nuevo Producto');
    });

    // Guardar
    $('#btGuardar').on('click', function() {
        guardarProducto();
    });

    // Cargar lista de productos al abrir la página
    //cargarProductos();
});
