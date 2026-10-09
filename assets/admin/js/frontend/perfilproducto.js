const adminBasePath = window.location.pathname.replace(/\/admonproductos.*$/, "");
const Producto_ID = $("#productoId").val();

const endpoints = {
  serviciosList: `${adminBasePath}/servicios/list`,
  obtenerServiciosProducto: `${adminBasePath}/obtenerServiciosProducto/${Producto_ID}`,
  editarProducto: `${adminBasePath}/admonproductos/editar`,
  uploadGalleryImage: `${adminBasePath}/admonproductos/uploadGalleryImage`,
  deleteGalleryImage: `${adminBasePath}/admonproductos/deleteGalleryImage`,
  agregarServicioProducto: `${adminBasePath}/admonproductos/agregarServicioProducto`,
  eliminarServicioProducto: `${adminBasePath}/admonproductos/eliminarServicioProducto`
};

Dropzone.autoDiscover = false;
let galeriaDropzone;
let serviciosSeleccionados = [];

$('#servicio_id').select2({
    dropdownParent: $('#modServicios'), // ID del modal
    placeholder: 'Seleccionar servicio o agregue uno nuevo',
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
        url: endpoints.serviciosList,
        dataType: 'json',
        delay: 250,
        processResults: function(data) {
            return {
                results: data.data.map(function(serv) {
                    return {
                        id: serv.Servicio_ID,
                        text: serv.Nombre_Servicio,
                        newTag: false
                    };
                })
            };
        },
        cache: true
    }
});

function normalizeServiceResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && response.success && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

function cargarServicios() {
  $.ajax({
    url: endpoints.obtenerServiciosProducto,
    type: 'GET',
    dataType: 'json',
    success: function (servicios) {
      const serviciosList = normalizeServiceResponse(servicios);
      let html = '';

      if (serviciosList.length === 0) {
        html = `
          <tr>
            <td colspan="2" class="text-center">No hay servicios vinculados.</td>
          </tr>
        `;
      } else {
        serviciosList.forEach(function (servicio) {
          html += `
            <tr>
              <td>${servicio.Nombre_Servicio}</td>
              <td>
                <button type="button" class="btn btn-sm btn-danger btnEliminarServicio" data-id="${servicio.ServProducto_ID}">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          `;
        });
      }

      $('#tbodyServicios').html(html);
    },
    error: function () {
      const errorRow = `
        <tr>
          <td colspan="2" class="text-center text-danger">Error al cargar los servicios.</td>
        </tr>
      `;
      $('#tbodyServicios').html(errorRow);
      $('#tbodyServiciosModal').html(errorRow);
    }
  });
}

function loadServiceOptions() {
  $.ajax({
    url: endpoints.serviciosList,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const servicios = normalizeServiceResponse(response);
      let options = '<option value="">Seleccionar servicio</option>';
      servicios.forEach(function (servicio) {
        options += `<option value="${servicio.Servicio_ID}">${servicio.Nombre_Servicio}</option>`;
      });
      $('#servicio_id').html(options);
    },
    error: function () {
      $('#servicio_id').html('<option value="">Error al cargar servicios</option>');
    }
  });
}

function initializeGaleriaDropzone() {
  if (galeriaDropzone) {
    return;
  }

  galeriaDropzone = new Dropzone('#dropzoneArea', {
    url: endpoints.uploadGalleryImage,
    autoProcessQueue: false,
    uploadMultiple: false,
    maxFiles: 10,
    maxFilesize: 1024,
    acceptedFiles: 'image/*',
    paramName: 'img_galeria',
    addRemoveLinks: true,
    dictDefaultMessage: 'Arrastra las imágenes o haz clic aquí para seleccionarlas',
    dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}GB). Máximo: {{maxFilesize}}GB.',
    init: function () {
      this.on('sending', function (file, xhr, formData) {
        formData.append('producto_id', Producto_ID);
      });

      this.on('success', function (file, response) {
        if (response && response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: response.message || 'Imagen cargada correctamente'
          }).then(function () {
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: (response && response.message) ? response.message : 'Error al cargar la imagen'
          });
        }
      });

      this.on('error', function (file, errorMessage) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage.toString()
        });
      });
    }
  });
}

function submitEditProduct() {
  const formData = new FormData($('#formEditarProducto')[0]);

  $.ajax({
    url: endpoints.editarProducto,
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    dataType: 'json',
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.message || 'Producto actualizado correctamente'
        }).then(function () {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Error al guardar los cambios'
        });
      }
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

function agregarServicio() {
  const servicioId = serviciosSeleccionados.length > 0 ? serviciosSeleccionados[0].id : null;

  if (!servicioId) {
    Swal.fire({
      icon: 'warning',
      title: 'Seleccione un servicio',
      text: 'Por favor, seleccione un servicio para agregar.'
    });
    return;
  }

  $.ajax({
    url: endpoints.agregarServicioProducto,
    type: 'POST',
    data: {
      producto_id: Producto_ID,
      servicio_id: servicioId
    },
    dataType: 'json',
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.message || 'Servicio agregado correctamente'
        });
        $('#modServicios').modal('hide');
        $('#servicio_id').val(null).trigger('change');
        serviciosSeleccionados = [];
        $('#tbodyServiciosModal').empty();

        cargarServicios();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Error al agregar el servicio'
        });
      }
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

// Agregar servicio a la tabla
// Renderizar tabla de servicios
function renderServiciosTable() {
    const tbody = $('#tbodyServiciosModal');
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

function eliminarServicio(servicioId) {

  $.ajax({
    url: endpoints.eliminarServicioProducto,
    type: 'POST',
    data: {
     id: servicioId
    },
    dataType: 'json',
    success: function (response) {

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.message || 'Servicio eliminado correctamente'
        });
        cargarServicios();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Error al eliminar el servicio'
        });
      }
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

function eliminarImagenGaleria(galeriaId) {
  $.ajax({
    url: endpoints.deleteGalleryImage,
    type: 'POST',
    data: { galeria_id: galeriaId },
    dataType: 'json',
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.message || 'Imagen eliminada correctamente'
        }).then(function () {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Error al eliminar la imagen'
        });
      }
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

$(document).ready(function () {
  loadServiceOptions();
  cargarServicios();
  initializeGaleriaDropzone();

  $('#btnGuardarGaleria').on('click', function () {
    if (!galeriaDropzone || galeriaDropzone.files.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona al menos una imagen',
        text: 'Debes seleccionar una imagen para agregar a la galería.'
      });
      return;
    }
    galeriaDropzone.processQueue();
  });

  $('#btnGuardarEdicion').on('click', function () {
    submitEditProduct();
  });

  $('#btnGuardarServicio').on('click', function () {
    agregarServicio();
  });

  $(document).on('click', '.btnEliminarServicio', function () {
    const servicioId = $(this).data('id');
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(function (result) {
      if (result.isConfirmed) {
        eliminarServicio(servicioId);
      }
    });
  });

  $(document).on('click', '.btnEliminarImagen', function () {
    const galeriaId = $(this).data('id');
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta imagen se eliminará permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(function (result) {
      if (result.isConfirmed) {
        eliminarImagenGaleria(galeriaId);
      }
    });
  });

  $('#btnAbrirModalServicio').on('click', function () {
    loadServiceOptions();
    cargarServicios();
  });
});
