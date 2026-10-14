const adminBasePath = window.location.pathname.replace(/\/admonproductos.*$/, "");
const Producto_ID = $("#productoId").val();

const endpoints = {
  editarProducto: `${adminBasePath}/admonproductos/editar`,
  uploadGalleryImage: `${adminBasePath}/admonproductos/uploadGalleryImage`,
  deleteGalleryImage: `${adminBasePath}/admonproductos/deleteGalleryImage`,
 };

Dropzone.autoDiscover = false;
let galeriaDropzone;
let serviciosSeleccionados = [];



function normalizeServiceResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && response.success && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
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
