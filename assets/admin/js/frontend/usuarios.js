
let tabUsuarios = null;
let UsuarioID = 0;

const api = 'usuarios/';


const myModalEl = document.getElementById('modUsuario')
myModalEl.addEventListener('hidden.bs.modal', function (_event) {
    $('.divpass').show();
    items.frmUsuarios[0].reset();
});

const items = {
    frmUsuarios: $('#frmUsuarios'),
    CambiarPass: $('#btnCambiarPss'),
    frmPass: $('#frmPass'),
    guardar: $('#btnGuardar'),
    tabla: $('#tabUsuarios'),
    modPass: new bootstrap.Modal(document.getElementById('modPass')),
    modUsuario: new bootstrap.Modal(document.getElementById('modUsuario')),
}

function CommonResponse(response) {
    Swal.fire({
        title: swalTitle,
        text: response.message,
        icon: response.error ? 'error' : 'success'
    });

    tabUsuarios.ajax.reload();

    items.modPass.hide();
    items.modUsuario.hide();
    items.frmUsuarios[0].reset();
    items.frmPass[0].reset();
    $('#usuarioID').val(0);
    $('.divpass').show();
}

function CrearUsuario(data){
    if (items.frmUsuarios.valid()) {
        $.ajax({
            type: "POST",
            url: `${api}Crear`,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "JSON",
            success: CommonResponse,
            error: error_response
        });
    }
}

function UpdateUsuario(data){
    if (items.frmUsuarios.valid()) {
        $.ajax({
            type: "PUT",
            url: `${api}Actualizar`,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "JSON",
            success: CommonResponse,
            error: error_response
        });
    }
}

function UpdatePasswrd(e){
    e.preventDefault();

    if(items.frmPass.valid()){
        const data = {
            usuarioID: UsuarioID,
            passwrd: $('#newpass').val()
        }

        $.ajax({
            type: "PUT",
            url: `${api}UpdPass`,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "JSON",
            success: CommonResponse,
            error: error_response
        });
    }
}

function ModalCambiarPass(e){
    e.preventDefault();

    UsuarioID = parseInt($(this).data('id'));
    items.modPass.show();
}

function DesactivarUsuario(e){
    e.preventDefault();

    const datos = $(this).data();

    Swal.fire({
        title: swalTitle,
        text: `¿Desea desactivar al usuario ${datos.name.toUpperCase()}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Si, desactivar',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {

            const activo = parseInt(datos.activo);
            const model = {
                usuarioID: datos.id,
                activo: activo
            }

            $.ajax({
                type: "PUT",
                url: `${api}Desactivar`,
                data: JSON.stringify(model),
                contentType: "application/json",
                dataType: "JSON",
                success: CommonResponse,
                error: error_response
            });
        }
    });

}

function SetDatosUsuatio(response) {
    $('.divpass').hide();

    const infoUsr = response.objResponse[0];

    for (const key in infoUsr) {
        $('#' + key.toLocaleLowerCase()).val(infoUsr[key]);
    }
    $('#activo').prop('checked', infoUsr.Activo == 1);
    $('#usuarioID').val(infoUsr.UsuarioID);

//////    console.log(infoUsr);

    items.modUsuario.show();
}

function GetDatosUsuario(e){
    e.preventDefault();

    $.ajax({
        type: "GET",
        url: `${api}GetUser`,
        data: {
            userid: $(this).data('id')
        },
        contentType: "application/json",
        dataType: "JSON",
        success: SetDatosUsuatio,
        error: error_response
    });
}

function Accion(e){
    e.preventDefault();

    const id = parseInt($('#usuarioID').val());

    const fm = items.frmUsuarios.BSerializeToJson({
        empty: false,
        boolean: true,
        disabled: true
    });

    if(id == 0){
        CrearUsuario(fm);
    }else{
        UpdateUsuario(fm);
    }
}

items.CambiarPass.click(UpdatePasswrd);
items.guardar.click(Accion);
items.tabla.on('click','.btnUpdate',GetDatosUsuario);
items.tabla.on('click','.btUpdPass',ModalCambiarPass);
items.tabla.on('click','.btnDelete',DesactivarUsuario);


items.frmUsuarios.validate({
    rules: {
        nombre: { required: true },
        correo: {
            required: true,
            email: true
        },
        passwrd: {
            required: function() {
                // Solo requerido si es creación (usuarioID = 0)
                return $('#usuarioID').val() == 0;
            },
            minlength: 6
        },
        rpass: {
            required: function() {
                // Solo requerido si es creación
                return $('#usuarioID').val() == 0;
            },
            minlength: 6,
            equalTo: '#passwrd'
        }
    },
    messages: {
        nombre: "El campo nombre es requerido",
        correo: {
            required: "El correo es requerido",
            email: "El correo debe ser válido"
        },
        passwrd: {
            required: "El password es obligatorio",
            minlength: "El password debe contar con al menos 6 caracteres"
        },
        rpass:{
            required: "Por favor confirme el password",
            minlength: "El password debe contar con al menos 6 caracteres",
            equalTo: "El password no coincide"
        }
    }
});

items.frmPass.validate({
    rules: {
        newpass: {
            required: true,
            minlength: 6
        },
        renewpass: {
            required: true,
            minlength: 6,
            equalTo: '#newpass'
        }
    },
    messages: {
        newpass: {
            required: "El password es obligatorio",
            minlength: "El password debe contar con al menos 6 caracteres"
        },
        renewpass:{
            required: "Por favor confirme el password",
            minlength: "El password debe contar con al menos 6 caracteres",
            equalTo: "El password no coincide"
        }
    }
});

tabUsuarios = items.tabla.DataTable({
    language: TableLanguaje,
    pageLength: 20,
    lengthChange: false,
    ordering: false,
    processing: true,
    serverSide: true,
    ajax: {
        url: `${api}LstUsuarios`,
        type: 'GET'
    },
    columns: [
        { data: 'UsuarioID' }, //0
        { data: 'Nombre' }, //1
        { data: 'Correo' }, //2
        { data: 'rol' }, // 3
        { data: 'Activo' }, //4
        { data: 'UsuarioID' } //5
    ],
    columnDefs: [
        {
            targets: 4,
            orderable: false,
            render: function (data) {
                return (parseInt(data) == 0) ? '<span class="badge light badge-success">Activo</span>' : '<span class="badge light badge-danger">Inactivo</span>'
            }
        },
        {
            targets: 5,
            orderable: false,
            render: function (_data, _type, row) {
                return `
                <button class="btn btn-info shadow btn-xs sharp me-1 btnUpdate" data-id="${row.UsuarioID}" tooltip="Editar usuario"><i class="fa-solid fa-user-pen"></i></button>
                <button class="btn btn-warning shadow btn-xs sharp me-1 btUpdPass" data-id="${row.UsuarioID}" tooltip="Cambiar Password"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-danger shadow btn-xs sharp me-1 btnDelete" data-id="${row.UsuarioID}" data-activo="${row.Activo}" data-name="${row.Nombre}" tooltip="Desactivar usuario"><i class="fa-solid fa-user-slash"></i></button>`
            }
        }
    ]
});
