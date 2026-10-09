
let table = null;

function resetBannerForm() {
    $('#frmBanner')[0].reset();
    $('#id').val('');
    $('#imagen_actual').val('');
    $('#imagenPreview').attr('src', '').addClass('d-none');
    $('#estado').val('activo');
}

function renderBannerRow(data) {
    return `
        <tr>
            <td>${data.Banner_ID}</td>
            <td>${data.imagen ? `<img src="${data.imagen_url}" alt="Banner" style="max-width:120px; max-height:80px;" />` : 'Sin imagen'}</td>
            <td>${data.Titulo || ''}</td>
            <td>${data.Subtitulo || ''}</td>
            <td>${data.Activo ? '<span class="badge light badge-success">Activo</span>' : '<span class="badge light badge-danger">Inactivo</span>'}</td>
            <td>
                <button class="btn btn-sm btn-info btn-edit" data-id="${data.Banner_ID}">Editar</button>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${data.Banner_ID}">Eliminar</button>
            </td>
        </tr>
    `;
}

function loadBannerTable() {
    $.get('banner/list', function (response) {
        if (!response.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || 'No se pudieron cargar los banners'
            });
            return;
        }

        const tbody = $('#tabBanner tbody');
        tbody.empty();

        response.data.forEach(function (banner) {
            tbody.append(renderBannerRow(banner));
        });
    }, 'json');
}

function fillBannerForm(banner) {
    $('#Banner_ID').val(banner.Banner_ID);
    $('#titulo').val(banner.Titulo);
    $('#subtitulo').val(banner.Subtitulo);
    $('#titulo_boton').val(banner.Titulo_Boton);
    $('#url_boton').val(banner.Url_Boton);
    $('#estado').val(banner.activo ? 'activo' : 'inactivo');
    $('#imagen_actual').val(banner.imagen || '');

    if (banner.imagen_url) {
        $('#imagenPreview').attr('src', banner.imagen_url).removeClass('d-none');
    } else {
        $('#imagenPreview').attr('src', '').addClass('d-none');
    }
}

function saveBanner() {
    const formData = new FormData($('#frmBanner')[0]);

    $.ajax({
        url: 'banner/guardar',
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
                    text: response.message || 'Error al guardar el banner'
                });
                return;
            }

            $('#modBanners').modal('hide');
            loadBannerTable();
            resetBannerForm();
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
                text: 'Error en la petición'
            });
        }
    });
}

function deleteBanner(id) {
    Swal.fire({
        title: 'Eliminar banner',
        text: '¿Estás seguro de eliminar este banner?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (!result.isConfirmed) {
            return;
        }

        $.post('banner/eliminar', { id }, function (response) {
            if (!response.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo eliminar el banner'
                });
                return;
            }

            loadBannerTable();
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: response.message
            });
        }, 'json');
    });
}

$(document).ready(function () {
    loadBannerTable();

    $('#btnNuevoBanner').on('click', function () {
        resetBannerForm();
        $('#modBanners').modal('show');
    });

    $('#btGuardar').on('click', function () {
        saveBanner();
    });

    $('#tabBanner').on('click', '.btn-edit', function () {
        const id = $(this).data('id');
        $.get('banner/obtener?id=' + id, function (response) {
            if (!response.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo cargar el banner'
                });
                return;
            }
            fillBannerForm(response.data);
            $('#modBanners').modal('show');
        }, 'json');
    });

    $('#tabBanner').on('click', '.btn-delete', function () {
        const id = $(this).data('id');
        deleteBanner(id);
    });
});
