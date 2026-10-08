<?php

require_once __DIR__ . '/vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/app/views');
$twig = new \Twig\Environment($loader, [
    'cache' => false, // Cambiar a __DIR__ . '/app/cache' en producción
    'debug' => true
]);

$url = isset($_GET['url']) ? rtrim($_GET['url'], '/') : 'home';
$urlSegments = explode('/', filter_var($url, FILTER_SANITIZE_URL));


$isAdmin = false;
if (isset($urlSegments[0]) && $urlSegments[0] === 'admin') {
    $isAdmin = true;
    array_shift($urlSegments); // Removemos 'admin' para evaluar el controlador/vista real
}


$controllerName = !empty($urlSegments[0]) ? ucfirst($urlSegments[0]) . 'Controller' : 'HomeController';
$actionName = isset($urlSegments[1]) ? $urlSegments[1] : 'index';
$params = array_slice($urlSegments, 2);


$controllerDir = __DIR__ . '/app/controller/';
$controllerPath = $controllerDir . ($isAdmin ? 'admin/' : '') . $controllerName . '.php';


if (file_exists($controllerPath)) {
    require_once $controllerPath;

    if (class_exists($controllerName)) {
        $controller = new $controllerName($twig);

        if (method_exists($controller, $actionName)) {
            call_user_func_array([$controller, $actionName], $params);
        } else {
            http_response_code(404);
            echo "Error 404: La acción '{$actionName}' no existe en el controlador '{$controllerName}'.";
        }
    } else {
        http_response_code(404);
        echo "Error 404: La clase '{$controllerName}' no está correctamente definida.";
    }
} else {
    $viewPath = ($isAdmin ? 'admin/' : '') . (!empty($urlSegments[0]) ? $urlSegments[0] : 'home') . '.twig';

    try {
        echo $twig->render($viewPath, [
            'params' => $urlSegments,
            'get'    => $_GET
        ]);
    } catch (\Exception $e) {
        http_response_code(404);
        echo "Error 404: La vista o el controlador solicitado no existen.";
    }
}
