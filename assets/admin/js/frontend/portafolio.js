Dropzone.autoDiscover = false;
let portafolioDropzone;

function initializePortafolioDropzone() {
    if (portafolioDropzone) {
        portafolioDropzone.destroy();
    }

    portafolioDropzone = new Dropzone('#dropzoneArea', {
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

function resetPortafolioForm() {
    $('#frmPortafolio')[0].reset();
    $('#Portafolio_ID').val('');
    $('#imagen_actual').val('');
    $('#imagenPreview').attr('src', '');
    if (portafolioDropzone) {
        portafolioDropzone.removeAllFiles(true);
    }
}

function renderPortafolioRow(item) {
    return `
        <tr>
            <td>${item.Portafolio_ID}</td>
            <td>${item.img_portafolio ? `<img src="${item.imagen_url}" alt="Portafolio" style="max-width:120px; max-height:80px;" />` : 'Sin imagen'}</td>
            <td>${item.Titulo || ''}</td>
            <td>${item.Descripcion.slice(0, 80) || ''}</td>
            <td>${item.Activo ? '<span class="badge light badge-success">Activo</span>' : '<span class="badge light badge-danger">Inactivo</span>'}</td>
            <td>
                <a href="portafolio/perfil/${item.Portafolio_ID}" class="btn btn-sm btn-info btn-edit" data-id="${item.Portafolio_ID}">Editar</a>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${item.Portafolio_ID}">Eliminar</button>
            </td>
        </tr>
    `;
}

function loadPortafolioTable() {
    $.get('portafolio/list', function (response) {
        if (!response.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || 'No se pudo cargar el portafolio'
            });
            return;
        }

        const tbody = $('#tabPortafolio tbody');
        tbody.empty();
        response.data.forEach(function (item) {
            tbody.append(renderPortafolioRow(item));
        });
    }, 'json').fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error en la petición al servidor'
        });
    });
}

function fillPortafolioForm(data) {
    $('#Portafolio_ID').val(data.Portafolio_ID);
    $('#titulo').val(data.Titulo);
    $('#descripcion').val(data.Descripcion);
    $('#imagen_actual').val(data.img_portafolio || '');

    if (data.img_portafolio) {
        $('#imagenPreview').attr('src', data.imagen_url);
        $('#imagePreviewContainer').removeClass('d-none');
    } else {
        $('#imagenPreview').attr('src', '');
        $('#imagePreviewContainer').addClass('d-none');
    }

    $('#img_portafolio').removeClass('d-none');
    $('#dropzoneArea').addClass('d-none');
}

function savePortafolio() {
    const formData = new FormData($('#frmPortafolio')[0]);
    const portafolioId = $('#Portafolio_ID').val();
    const isEdit = portafolioId !== '' && parseInt(portafolioId, 10) > 0;

    if (!isEdit) {
        if (!portafolioDropzone || portafolioDropzone.files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Imagen requerida',
                text: 'Debes subir al menos una imagen para el portafolio.'
            });
            return;
        }
        // Append múltiples archivos
        portafolioDropzone.files.forEach(file => {
            formData.append('img_portafolio[]', file);
        });
    } else {
        const fileInput = $('#img_portafolio')[0];
        if (fileInput.files.length > 0) {
            formData.append('img_portafolio', fileInput.files[0]);
        }
    }

    $.ajax({
        url: 'portafolio/guardar',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        dataType: 'json',
        success: function (response) {
            if (!response.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo guardar el portafolio'
                });
                return;
            }

            $('#modImagen').modal('hide');
            loadPortafolioTable();
            resetPortafolioForm();
            Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: response.message
            });
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la petición al servidor'
            });
        }
    });
}

function deletePortafolio(id) {
    Swal.fire({
        title: 'Eliminar registro',
        text: '¿Estás seguro de eliminar este registro del portafolio?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (!result.isConfirmed) {
            return;
        }

        $.post('portafolio/eliminar', { id: id }, function (response) {
            if (!response.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo eliminar el registro'
                });
                return;
            }

            loadPortafolioTable();
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: response.message
            });
        }, 'json').fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la petición al servidor'
            });
        });
    });
}

$(document).ready(function () {
    initializePortafolioDropzone();
    resetPortafolioForm();
    loadPortafolioTable();

    $('#btnNuevoPortafolio').on('click', function () {
        resetPortafolioForm();
        $('#modImagen .modal-title').text('Agregar portafolio');
        $('#modImagen').modal('show');
    });

    $('#btGuardar').on('click', function () {
        savePortafolio();
    });

    $('#tabPortafolio').on('click', '.btn-edit', function () {
        const id = $(this).data('id');
        $.get('portafolio/obtener?id=' + id, function (response) {
            if (!response.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo cargar el registro'
                });
                return;
            }

            fillPortafolioForm(response.data);
            $('#modImagen .modal-title').text('Editar portafolio');
            $('#modImagen').modal('show');
        }, 'json').fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la petición al servidor'
            });
        });
    });

    $('#tabPortafolio').on('click', '.btn-delete', function () {
        const id = $(this).data('id');
        deletePortafolio(id);
    });
});
