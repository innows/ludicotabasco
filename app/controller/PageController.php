<?php

declare(strict_types=1);

use Twig\Environment;

/** Enruta páginas públicas y del administrador hacia template/views. */
final class PageController
{
    public function __construct(
        private Environment $twig,
        private string $viewsPath
    ) {}

    private function resolvePath(): string
    {
        $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';

        // Directorio donde vive index.php, p. ej. "/ludico" (o "" si está en la raíz)
        $basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');

        if ($basePath !== '' && str_starts_with($uriPath, $basePath)) {
            $uriPath = substr($uriPath, strlen($basePath));
        }

        return trim($uriPath, '/');
    }

    public function dispatch(?string $requestedPath = null): void
    {
        $path = $requestedPath !== null && $requestedPath !== ''
            ? trim($requestedPath, '/')
            : $this->resolvePath();

        $segments = $path === '' ? [] : explode('/', $path);
        $isAdmin = ($segments[0] ?? '') === 'admin';

        if ($isAdmin) {
            array_shift($segments);
            $page = $segments[0] ?? 'login';
            // El administrador sirve únicamente vistas bajo views/admin.
            $view = 'admin/' . $page . '.twig';
        } else {
            $page = $segments[0] ?? 'home';
            if ($page === 'index') {
                $page = 'home';
            }

            $view = $page . '.twig';
        }
        if (
            !preg_match('/^[a-zA-Z0-9_-]+$/', $page)
            || !is_file($this->viewsPath . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $view))
        ) {
            http_response_code(404);
            echo 'Página no encontrada.';
            return;
        }

        try {
            echo $this->twig->render($view, [
                'params' => array_slice($segments, 1),
                'get' => $_GET,
            ]);
        } catch (\Twig\Error\LoaderError $exception) {
            http_response_code(404);
            echo 'Página no encontrada.';
        } catch (\Twig\Error\RuntimeError | \Twig\Error\SyntaxError $exception) {
            http_response_code(500);
            echo 'No fue posible cargar la página.';
        }
    }
}
