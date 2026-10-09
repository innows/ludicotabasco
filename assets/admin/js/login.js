
$(function () {
    $('#frmLogin').on('submit', function (e) {
        e.preventDefault();

        const username = $.trim($('#dz-email').val());
        const password = $('#dz-password').val();

        if (!username || !password) {
            Swal.fire({
                title: 'Administrador',
                text: 'Por favor, completa todos los campos.',
                icon: 'error'
            });
            return;
        }

        LoadingSwal();

        $.ajax({
            url: this.action || window.location.href,
            type: 'POST',
            dataType: 'json',
            data: {
                username: username,
                password: password
            }
        })
            .done(function (response) {
                Swal.close();
                if (response.success) {
                    window.location.href = response.redirect || 'index';
                } else {
                    Swal.fire({
                        title: 'Administrador',
                        text: response.message || 'Usuario o contraseña incorrectos.',
                        icon: 'error'
                    });
                }
            })
            .fail(function (jqXHR) {
                Swal.close();
                let message = 'Hubo un error al iniciar sesión. Intenta de nuevo.';
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    message = jqXHR.responseJSON.message;
                }
                Swal.fire({
                    title: 'Administrador',
                    text: message,
                    icon: 'error'
                });
            });
    });
});

function LoadingSwal() {
    Swal.fire({
        title: 'Cargando',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}
