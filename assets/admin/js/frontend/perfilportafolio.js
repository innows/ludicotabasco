const adminBasePath = window.location.pathname.replace(/\/portafolio.*$/, "");
const Portafolio_ID = $("#portafolioId").val();

const endpoints = {
  obtenerPortafolio: `${adminBasePath}/portafolio/obtener?id=${Portafolio_ID}`,
  guardarPortafolio: `${adminBasePath}/portafolio/guardar`,
  eliminarPortafolio: `${adminBasePath}/portafolio/eliminar`,
  uploadGalleryImage: `${adminBasePath}/portafolio/uploadGalleryImage`,
  deleteGalleryImage: `${adminBasePath}/portafolio/deleteGalleryImage`
};

Dropzone.autoDiscover = false;
let galeriaDropzone;

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
        formData.append('portafolio_id', Portafolio_ID);
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

function loadPortafolioData() {
  $.ajax({
    url: endpoints.obtenerPortafolio,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.success && response.data) {
        const data = response.data;
        $('#Portafolio_ID').val(data.Portafolio_ID || Portafolio_ID);
        $('#titulo').val(data.Titulo || '');
        $('#descripcion').val(data.Descripcion || '');
        $('#nombre_cliente').val(data.Nombre_Cliente || '');
        $('#fecha_servicio').val(data.Fecha_Servicio || '');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'No se pudo cargar la información del portafolio.'
        });
      }
    },
    error: function () {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al obtener los datos del portafolio.'
      });
    }
  });
}

function submitPortafolioForm() {
  const formData = new FormData($('#frmPortafolio')[0]);
  formData.append('Portafolio_ID', $('#Portafolio_ID').val() || Portafolio_ID);

  $.ajax({
    url: endpoints.guardarPortafolio,
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
          text: response.message || 'Portafolio actualizado correctamente'
        }).then(function () {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Error al guardar el portafolio'
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
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta imagen se eliminará permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(function (result) {
    if (result.isConfirmed) {
      $.ajax({
        url: endpoints.deleteGalleryImage,
        type: 'POST',
        data: { galeria_id: galeriaId },
        dataType: 'json',
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
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
  });
}

$(document).ready(function () {
  initializeGaleriaDropzone();

  $('#btnEditarPortafolio').on('click', function () {
    loadPortafolioData();
  });

  $('#btGuardar').on('click', function () {
    submitPortafolioForm();
  });



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

  $(document).on('click', '.btnEliminarImagen', function () {
    const galeriaId = $(this).data('id');
    eliminarImagenGaleria(galeriaId);
  });
});
