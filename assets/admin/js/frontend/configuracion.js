$(function () {
    const $form = $('.admin-form');
    if (!$form.length) {
        return;
    }

    $form.on('submit', function (e) {
        e.preventDefault();

        const $submitButton = $(this).find('button[type="submit"]');
        const actionUrl = $(this).attr('action') || window.location.href;

        Swal.fire({
            title: 'Actualizar configuracion',
            text: 'Deseas guardar los cambios?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si, actualizar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            $submitButton.prop('disabled', true);

            Swal.fire({
                title: 'Guardando...',
                text: 'Espere un momento mientras se actualiza la configuracion.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            $.ajax({
                url: actionUrl,
                method: 'POST',
                data: $form.serialize(),
                dataType: 'json',
            })
                .done(function (response) {
                    if (response && response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Guardado',
                            text: response.message || 'La configuracion se actualizo correctamente.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: (response && response.message) ? response.message : 'No se pudo guardar la configuracion.',
                        });
                    }
                })
                .fail(function (jqXHR) {
                    let errorMessage = 'Error del servidor. Intenta nuevamente mas tarde.';
                    if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                        errorMessage = jqXHR.responseJSON.message;
                    } else if (jqXHR.responseText) {
                        try {
                            const json = JSON.parse(jqXHR.responseText);
                            if (json.message) {
                                errorMessage = json.message;
                            }
                        } catch (error) {
                            // No JSON body available.
                        }
                    }

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage,
                    });
                })
                .always(function () {
                    $submitButton.prop('disabled', false);
                });
        });
    });
});
