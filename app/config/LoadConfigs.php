<?php

// Session configuration
const SESSION_TIMEOUT_SECONDS = 1800; // 30 minutos de inactividad

function checkSessionTimeout(bool $api = false)
{
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['UsuarioID'])) {
        return;
    }

    $now = time();
    if (isset($_SESSION['last_activity']) && ($now - $_SESSION['last_activity']) > SESSION_TIMEOUT_SECONDS) {
        session_unset();
        session_destroy();

        if ($api) {
            http_response_code(HTTP_UNAUTHORIZED);
            echo json_encode(['error' => true, 'message' => 'Sesión expirada']);
            exit;
        }

        header('Location: login?expired=1');
        exit;
    }

    // Refresh last activity time
    $_SESSION['last_activity'] = $now;
}

function validarSession()
{
    if (!isset($_SESSION['UsuarioID'])) {
        http_response_code(HTTP_UNAUTHORIZED);
        echo json_encode(
            [
                'error' => true,
                'message' => 'Debes iniciar session para continuar'
            ]
        );
        exit;
    }
}

function methodInvalid()
{
    http_response_code(HTTP_NOT_IMPLEMENTED);
    echo json_encode(
        [
            'error' => true,
            'message' => 'Metodo desconocido'
        ]
    );
}
