<?php
declare(strict_types=1);

// 1. Validar dependencias de Composer antes de continuar
$autoloader = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloader)) {
    http_response_code(500);
    exit("Error crítico: Dependencias no instaladas. Ejecute <code>composer install</code>.");
}

require_once $autoloader;
require_once __DIR__ . '/app/config/DbSingleton.php';
require_once __DIR__ . '/app/controller/AuthController.php';
require_once __DIR__ . '/app/controller/PageController.php';

try {
    // 2. Configuración de Entorno Twig
    $viewsPath = __DIR__ . '/template/views';
    
    if (!is_dir($viewsPath)) {
        throw new \RuntimeException("El directorio de vistas no existe: {$viewsPath}");
    }

    $loader = new Twig\Loader\FilesystemLoader($viewsPath);
    $twig = new Twig\Environment($loader, [
        'cache' => false, // Cambiar a __DIR__ . '/app/cache' en producción
        'debug' => true,  // Útil en entorno local
        'autoescape' => 'html',
    ]);

    // 3. Resolución limpia de Base URL (soporte para subcarpetas en localhost)
     $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        
        // Extraer el directorio base del script actual de forma limpia
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '/';
        $baseDir = str_replace('\\', '/', dirname($scriptName));
        
        // Normalizar para evitar dobles slashes y asegurar formato correcto
        $baseUrl = rtrim($protocol . $host . $baseDir, '/') . '/';
        
        // Si prefieres rutas relativas puros (ej: "/") cuando está en la raíz:
        $scriptDirectory = str_replace('\\', '/', dirname($scriptName));
        $baseUrlRelative = rtrim($scriptDirectory, '/') . '/';
        if ($baseUrlRelative === '//') {
            $baseUrlRelative = '/';
        }
        
        // Inyección de variables globales a Twig
        $twig->addGlobal('baseUrl', $baseUrlRelative); // O usa $baseUrl si necesitas URL absoluta (https://tudominio.com/)
        $twig->addGlobal('adminUrl', rtrim($baseUrlRelative, '/') . '/admin');
        $twig->addGlobal('adminAssetsUrl', rtrim($baseUrlRelative, '/') . '/assets/admin');
    
  
    // 4. Sanitización y captura de la ruta solicitada
    $requestedPath = isset($_GET['url']) ? trim((string)$_GET['url'], '/') : '';

    // 5. Despacho al controlador principal
    $controller = new PageController($twig, $viewsPath, $baseUrl);
    $controller->dispatch($requestedPath);

} catch (\Throwable $e) {
    // Manejo centralizado de excepciones en desarrollo
    http_response_code(500);
    if (ini_get('display_errors')) {
        echo "<div style='font-family: monospace; background: #fff3f3; color: #a00; padding: 20px; border: 1px solid #faa;'>";
        echo "<h3>Excepción capturada:</h3>";
        echo "<p><strong>Mensaje:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<p><strong>Archivo:</strong> " . $e->getFile() . " en la línea " . $e->getLine() . "</p>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
        echo "</div>";
    } else {
        echo "<h1>500 Internal Server Error</h1><p>Ocurrió un error interno en la aplicación.</p>";
    }
}