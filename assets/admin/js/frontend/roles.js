
let rolID = 0;
let tabRoles = null;

const apiUsuarios = 'api/usuarios/';
const apiMenu = 'api/menu/';

const items = {
    frm: $('#frmRoles'),
    mod: document.getElementById('modRoles'),
    modM: document.getElementById('modAccesos'),
    rolID: $('#rolID'),
    tabla: $('#tabRoles'),
    modal: new bootstrap.Modal(document.getElementById('modRoles')),
    modalM: new bootstrap.Modal(document.getElementById('modAccesos')),
    guardar: $('#btGuardar'),
    btAddRol: $('#btAddRol')
}

function LimpiarForm() {
    items.frm[0].reset();
    items.rolID.val(0);
    items.modal.hide();
    items.modalM.hide();
    tabRoles.ajax.reload();
}

function CommonResponse(response) {
    Swal.fire({
        title: swalTitle,
        text: response.message,
        icon: response.error ? 'error' : 'success'
    });

    LimpiarForm();    
}

function Read(e){
    e.preventDefault();

    const rolID = $(this).data('id');

    $.ajax({
        type: "GET",
        url: `${apiUsuarios}GetRol`,
        data: {
            id: rolID,
        },
        dataType: "JSON",
        error: error_response,
        success: function (response) {
            if (!response.error) {
                const data = response.objResponse[0];
                items.modal.show();
                $('#rolID').val(data.RolID);
                $('#rol').val(data.Rol);
            } else {
                Swal.fire({
                    title: swalTitle,
                    text: response.message,
                    icon: 'error'
                });
            }
        }
    });
}

function Drop(e){
    e.preventDefault();

    const datos = $(this).data();

    Swal.fire({
        title: swalTitle,
        text: `¿Desea eliminar el rol ${datos.name.toUpperCase()}? Esta accion no se puede deshacer`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Si, eliminar',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {

            $.ajax({
                type: "DELETE",
                url: `${apiUsuarios}dropRol`,
                data: JSON.stringify(datos),
                contentType: "application/json",
                dataType: "JSON",
                success: CommonResponse,
                error: error_response
            });
        }
    });
}

function Accion(e){
    e.preventDefault();

    const rolID = parseInt(items.rolID.val());
    const fm = items.frm.BSerializeToJson({
        empty: false,
        boolean: true,
        disabled: true
    });

    if(fm.rol == ''){
        Swal.fire({
            title: swalTitle,
            text: 'El nombre del rol no puede estar vacio',
            icon: 'error'
        });
        return;
    }

    const type = rolID == 0 ? 'POST' : 'PUT';
    const method = rolID == 0 ? 'createRol' : 'updateRol';

    $.ajax({
        type: type,
        url: `${apiUsuarios}${method}`,
        data: JSON.stringify(fm),
        contentType: "application/json",
        dataType: "JSON",
        success: CommonResponse,
        error: error_response
    });
}

function GetMenu(e) {
    e.preventDefault();

    rolID = $(this).data('id');

    $.ajax({
        type: "GET",
        url: `${apiMenu}getMenu`,
        data:{
            RolID: rolID
        },
        dataType: "JSON",
        error: error_response,
        success: function (response) {
            const menu = response['objResponse']

            let liRoot = '';
            menu.forEach(root => {

                let childs = '';

                root.Hijos.forEach(child =>{
                    let chk = child.RolMenuID == 0 ? '':'checked'
                    childs += `<li>
                                    <input type="checkbox" class="form-check-input rolmenu" data-root="${root.MenuID}" data-menu="${child.MenuID}" name="c${child.MenuID}" id="c${child.MenuID}" ${chk}>
                                    <label class="form-check-label" for="c${child.MenuID}">${child.Menu}</label>
                                </li>`
                });

                liRoot += `<div class="col-4">
                            <li>
                            <strong>${root.Menu}</strong>
                            <ul>${childs}</ul>
                            </li>
                        </div>`
            });

            $('.treechck').html(liRoot);
            items.modalM.show();

        }
    });
}

function SetMenu(e){
    e.preventDefault();

    let menu = [];

    $('.rolmenu').each(function(_index, element){
        if($(element).is(':checked')){
            const data = $(element).data();
            menu.push({
                RolID: rolID,
                MenuID: data.menu,
                RootID: data.root
            })
        }
    })

    $.ajax({
        type: "POST",
        url: `${apiMenu}menurol`,
        data: JSON.stringify(menu),
        contentType: "application/json",
        dataType: "JSON",
        success: CommonResponse,
        error: error_response
    });

}

items.tabla.on('click','.btnRead', Read);
items.tabla.on('click','.btnDelete', Drop);
items.tabla.on('click','.btnAccesos', GetMenu);
items.guardar.click(Accion);
items.btAddRol.click(SetMenu);
items.mod.addEventListener('hidden.bs.modal', LimpiarForm);

tabRoles = items.tabla.DataTable({
    language: TableLanguaje,
    pageLength: 20,
    lengthChange: false,
    ordering: false,
    processing: true,
    serverSide: true,
    ajax: {
        url: `${apiUsuarios}ListaRoles`,
        type: 'GET'
    },
    columns: [
        { data: 'RolID' }, //0
        { data: 'Rol' }, //1
        { data: 'RolID' } //2
    ],
    columnDefs: [
        {
            targets: 2,
            orderable: false,
            render: function (_data, _type, row) {
                if(row.RolID !=2){
                    return `
                    <button class="btn btn-info shadow btn-xs sharp me-1 btnRead" data-id="${row.RolID}" tooltip="Editar Rol"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-primary shadow btn-xs sharp me-1 btnAccesos" data-id="${row.RolID}" tooltip="Editar accesos"><i class="fas fa-universal-access"></i></button>
                    <button class="btn btn-danger shadow btn-xs sharp me-1 btnDelete" data-rolid="${row.RolID}" data-name="${row.Rol}" tooltip="Eliminar Rol"><i class="fas fa-trash-can"></i></button>`
                   
                      
                }
                else{
                    return `No editable`
                }
                  }
        }
    ]
});
