
$('#usrLogOut').click(function (e) {
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: this.href,
        dataType: "JSON"
    }).done(function (response) {
        window.location.href = response.redirect || 'login';
    }).fail(function () {
        window.location.href = 'login';
    });
});

const swalTitle = 'Administrador';

const TableLanguaje = {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    zeroRecords: "No se encontraron registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "No hay registros disponibles",
    infoFiltered: "",
    paginate: {
        first: "Primero",
        last: "Último",
        next:     '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
        previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>'
    }
}

const commonPDFRule = {
    required: true,
    extension: "pdf"
}

const commonFilesRule = {
    required: true,
    extension: "pdf|png|jpeg|jpg"
}

const commonErrorMsgRule = {
    required: "Por favor ingrese el documento solicitado",
    extension: "Por favor ingrese un formato correcto"
}

const commonErrorRuleMsg = {
    required: "Este campo es requerido"
}

const commonErrorNumberMsg = {
    min: "El valor minimo permitido es 1",
    number: "Este campo solo acpeta numeros",
    required: "Este campo es requerido"
}

function error_response(xhr, _textStatus, errorThrown) {
    commonErrorMsg(`${errorThrown} : ${xhr.responseJSON.message}`);
}

function commonErrorMsg(msg){
    Swal.fire({
        title: swalTitle,
        text: msg,
        icon: 'error'
    });
}

function LoadingSwal() {
    Swal.fire({
        title: 'Loading',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function decodeEntity(inputStr) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = inputStr;
    return textarea.value;
}

function SetJSONDataAttr(json){
    return encodeURIComponent(json);
}

function GetJSONDataAttr(strJSON){
    return JSON.parse(decodeURIComponent(strJSON));
}

function leadingZeros(numero, zeros = 5){
    return String(numero).padStart(zeros, '0');
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const base64Image = reader.result.split(',')[1];
            resolve(base64Image);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

function formatFecha(strFecha) {
    if (!strFecha) return '';
    const fecha = new Date(strFecha);
    if (isNaN(fecha.getTime())) return strFecha; // Devuelve el string original si no es fecha válida

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(fecha).replace(',', '');
};

function formatMoneda(val) {
    const numero = parseFloat(val);
    if (isNaN(numero)) return '$0.00';
    
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    }).format(numero);
};
