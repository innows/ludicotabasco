<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/app/controller/PageController.php';

$viewsPath = __DIR__ . '/template/views';
$loader = new Twig\Loader\FilesystemLoader($viewsPath);
$twig = new Twig\Environment($loader, [
    'cache' => false,
    'debug' => false,
    'autoescape' => 'html',
]);

// Funciona tanto en la raíz del dominio como dentro de una carpeta (XAMPP).
$scriptDirectory = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
$baseUrl = rtrim($scriptDirectory, '/') . '/';
if ($baseUrl === '//') {
    $baseUrl = '/';
}
$twig->addGlobal('baseUrl', $baseUrl);

$requestedPath = $_GET['url'] ?? '';
if (!is_string($requestedPath)) {
    $requestedPath = '';
}

$controller = new PageController($twig, $viewsPath);
$controller->dispatch($requestedPath);
