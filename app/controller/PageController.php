<?php

declare(strict_types=1);

use Admin\Controllers\CategoriaController;
use Admin\Controllers\SubCategoriaController;
use App\Controller\AuthController;
use app\config\DbSingleton;
use Twig\Environment;

/** Enrutador HTTP para el sitio público y el panel de administración. */
final class PageController
{
    private const SESSION_TIMEOUT = 1800;
    private const DEFAULT_ACTION = 'index';

    /** Carpeta de controladores (fallback si la clase no se carga por autoload). Ajusta a tu ruta real. */
    private const CONTROLLERS_DIR = __DIR__ . '/';

    /** Vistas del panel que se renderizan directamente desde admin/<page>.twig */
    private const ADMIN_PAGES = [
        'index',
        'banner',
        'administrarproductos',
        'categorias',
        'subcategorias',
        'portafolio',
        'perfil',
        'perfilportafolio',
        'configuracion',
        'usuarios',
        'roles',
    ];

    /**
     * Endpoints por ámbito y página: Clase => [VERBO => [acciones]].
     * Agregar un módulo nuevo es una entrada más; las acciones son métodos públicos del controlador.
     */
    private const CONTROLLERS = [
        'admin' => [
            'banner' => [
                \Admin\Controllers\BannerController::class => [
                    'GET'  => ['list', 'obtener'],
                    'POST' => ['guardar', 'eliminar'],
                ],
            ],
            'categorias' => [
                CategoriaController::class => [
                    'GET'  => ['list', 'obtener'],
                    'POST' => ['guardar', 'eliminar'],
                ],
            ],
            'subcategorias' => [
                SubCategoriaController::class => [
                    'GET'  => ['list', 'obtener'],
                    'POST' => ['guardar', 'eliminar'],
                ],
            ],
            'admonproductos' => [
                \Admin\Controllers\ProductoController::class => [
                    'GET'  => ['index', 'list', 'obtener','perfil'],
                    'POST' => ['guardar', 'eliminar'],
                ],
            ],
            'producto'=> [
                \Admin\Controllers\ProductoController::class => [
                    'GET'  => ['perfil'],
                    'POST' => ['guardar'],
                ],
            ],
            'configuracion' => [
                \Admin\Controllers\ConfigController::class => [
                    'GET'  => ['index'],
                    'POST' => ['guardar'],
                ],
            ],
            'usuarios' => [
                \Admin\Controllers\UsuariosController::class => [
                    'GET'  => ['LstUsuarios', 'GetUser'],
                    'POST' => ['Crear', 'guardar', 'eliminar'],
                    'PUT' => ['Actualizar', 'Desactivar'],
                ],
            ],

        ],
        'public' => [
            // 'contacto' => [ContactoController::class => ['POST' => ['enviar']]],
        ],
    ];

    public function __construct(
        private readonly Environment $twig,
        private readonly string $viewsPath,
        private readonly string $baseUrl,
    ) {}

    /* ------------------------------------------------------------------ *
     * Entrada
     * ------------------------------------------------------------------ */

    public function dispatch(?string $requestedPath = null): void
    {
        $path = ($requestedPath !== null && $requestedPath !== '')
            ? trim($requestedPath, '/')
            : $this->resolvePath();
        $segments = $path === '' ? [] : explode('/', $path);

        if (($segments[0] ?? '') === 'admin') {
            $this->dispatchAdmin(array_slice($segments, 1));
            return;
        }

        $this->dispatchPublic($segments);
    }

    /* ------------------------------------------------------------------ *
     * Panel de administración
     * ------------------------------------------------------------------ */

    private function dispatchAdmin(array $segments): void
    {
        $page = $segments[0] ?? '';

        if ($page === '' || $page === 'index.php') {
            $this->redirect('admin/login');
        }

        $this->startSession();
        $this->expireInactiveSession();

        if ($page === 'login') {
            $this->handleLoginPage();
            return;
        }

        if ($page === 'logout') {
            $this->handleLogout();
        }

        $this->requireAuth();

        if ($page === 'index') {
            $this->renderAdmin('index');
            return;
        }

        if ($this->dispatchController('admin', $page, $segments[1] ?? null)) {
            return;
        }

        if (in_array($page, self::ADMIN_PAGES, true) && $this->viewExists('admin/' . $page . '.twig')) {
            $this->renderAdmin($page, ['params' => array_slice($segments, 1)]);
            return;
        }

        $this->abort('admin', 404, 'Recurso no encontrado.');
    }

    private function expireInactiveSession(): void
    {
        if (
            AuthController::loggedIn()
            && isset($_SESSION['last_activity'])
            && time() - (int) $_SESSION['last_activity'] > self::SESSION_TIMEOUT
        ) {
            AuthController::logout();
            $this->redirect('admin/login');
        }
    }

    private function requireAuth(): void
    {
        if (!AuthController::loggedIn()) {
            if ($this->isAjax()) {
                $this->json(['success' => false, 'message' => 'Tu sesión ha expirado.'], 401);
            }
            $this->redirect('admin/login');
        }

        $_SESSION['last_activity'] = time();
    }

    private function handleLoginPage(): void
    {
        if (AuthController::loggedIn()) {
            $this->redirect('admin/index');
        }

        if ($this->httpMethod() === 'POST') {
            $this->handleLogin();
            return;
        }

        $this->render('admin/login.twig');
    }

    private function handleLogin(): void
    {
        try {
            $database = DbSingleton::getInstance()->getDatabase();
            $result = (new AuthController($database))->attempt($this->requestData());
        } catch (\Throwable $e) {
            error_log('Admin login error: ' . $e->getMessage());
            $result = [
                'success' => false,
                'message' => 'No fue posible iniciar sesión. Inténtalo de nuevo.',
                'status'  => 500,
            ];
        }

        if (!$result['success']) {
            $status = (int) $result['status'];
            if ($this->isAjax()) {
                $this->json($result, $status);
            }
            $this->render('admin/login.twig', ['error' => $result['message']], $status);
            return;
        }

        if ($this->isAjax()) {
            $this->json(['success' => true, 'redirect' => $this->url('admin/index')]);
        }
        $this->redirect('admin/index');
    }

    private function handleLogout(): never
    {
        if ($this->httpMethod() !== 'POST') {
            header('Allow: POST');
            $this->abort('admin', 405, 'Método no permitido.');
            exit;
        }

        AuthController::logout();
        $this->json(['success' => true, 'redirect' => $this->url('admin/login')]);
    }

    /* ------------------------------------------------------------------ *
     * Sitio público
     * ------------------------------------------------------------------ */

    private function dispatchPublic(array $segments): void
    {
        $page = $segments[0] ?? 'home';
        $page = $page === 'index' ? 'home' : $page;

        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $page)) {
            $this->abort('public', 404, 'Recurso no encontrado.');
            return;
        }

        if ($this->dispatchController('public', $page, $segments[1] ?? null)) {
            return;
        }

        if (!$this->viewExists($page . '.twig')) {
            $this->abort('public', 404, 'Recurso no encontrado.');
            return;
        }

        $this->render($page . '.twig', ['params' => array_slice($segments, 1), 'get' => $_GET]);
    }

    /* ------------------------------------------------------------------ *
     * Despacho genérico a controladores (compartido admin / public)
     * ------------------------------------------------------------------ */

    /**
     * Resuelve /<page>/<action> contra CONTROLLERS[$scope][$page].
     *
     * @return bool true si la petición ya fue respondida; false si no hay controlador
     *              o acción (el flujo continúa hacia la vista).
     */
    private function dispatchController(string $scope, string $page, ?string $action): bool
    {
        $module = self::CONTROLLERS[$scope][$page] ?? null;
        if ($module === null) {
            return false;
        }

        $class    = array_key_first($module);
        $routes   = $module[$class];
        $implicit = $action === null || $action === '';
        $action   = $implicit ? self::DEFAULT_ACTION : $action;

        // Sin acción en la URL y sin 'index' declarado: sigue el flujo normal (vista)
        if ($implicit && !in_array($action, array_merge(...array_values($routes)), true)) {
            return false;
        }

        $method = $this->httpMethod();

        if (!in_array($action, $routes[$method] ?? [], true)) {
            $allowed = array_keys(array_filter(
                $routes,
                static fn(array $actions): bool => in_array($action, $actions, true)
            ));

            if ($allowed === []) {
                $this->abort($scope, 404, 'Recurso no encontrado.');
                return true;
            }

            header('Allow: ' . implode(', ', $allowed));
            $this->abort($scope, 405, 'Método no permitido.');
            return true;
        }

        $this->loadController($class);

        try {
            $result = (new $class(DbSingleton::getInstance()->getDatabase()))->$action();
            $this->respond($scope, $page, $result);
        } catch (\Throwable $e) {
            error_log(sprintf('%s::%s error: %s', $class, $action, $e->getMessage()));
            $this->abort($scope, 500, 'Error interno del servidor.');
        }

        return true;
    }

    /** Convención: array => renderiza la vista del módulo; string => redirect; null => el controlador ya respondió. */
    private function respond(string $scope, string $page, mixed $result): void
    {
        if (is_string($result)) {
            $this->redirect($result);
        }

        if (is_array($result)) {
            $scope === 'admin'
                ? $this->renderAdmin($page, $result)
                : $this->render($page . '.twig', $result);
        }
    }

    private function loadController(string $class): void
    {
        if (class_exists($class)) {
            return;
        }

        $file = self::CONTROLLERS_DIR . '/' . substr(strrchr('\\' . $class, '\\'), 1) . '.php';

        require_once $file;
    }

    /* ------------------------------------------------------------------ *
     * Respuestas
     * ------------------------------------------------------------------ */

    private function renderAdmin(string $page, array $context = [], int $status = 200): void
    {
        $this->render('admin/' . $page . '.twig', $context + [
            'Sistema' => 'Lúdico',
            'Nombre'  => $_SESSION['admin_name'] ?? 'Administrador',
        ], $status);
    }

    private function render(string $view, array $context = [], int $status = 200): void
    {
        http_response_code($status);
        echo $this->twig->render($view, $context);
    }

    /** Respuesta de error unificada: JSON para AJAX, vista 404 o texto plano en otro caso. */
    private function abort(string $scope, int $status, string $message): void
    {
        if ($this->isAjax()) {
            $this->json(['success' => false, 'message' => $message], $status);
        }

        if ($status === 404) {
            $scope === 'admin'
                ? $this->renderAdmin('404', [], 404)
                : $this->render('404.twig', [], 404);
            return;
        }

        http_response_code($status);
        echo $message;
    }

    private function json(array $payload, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function redirect(string $path): never
    {
        header('Location: ' . $this->url($path));
        exit;
    }

    /* ------------------------------------------------------------------ *
     * Utilidades
     * ------------------------------------------------------------------ */

    private function httpMethod(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    private function requestData(): array
    {
        if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            $data = json_decode((string) file_get_contents('php://input'), true);
            return is_array($data) ? $data : [];
        }

        return $_POST;
    }

    private function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    private function isAjax(): bool
    {
        return strtolower((string) ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '')) === 'xmlhttprequest'
            || str_contains((string) ($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json');
    }

    private function url(string $path): string
    {
        return rtrim($this->baseUrl, '/') . '/' . ltrim($path, '/');
    }

    private function viewExists(string $view): bool
    {
        return is_file($this->viewsPath . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $view));
    }

    private function resolvePath(): string
    {
        $uriPath  = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        $basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');

        if ($basePath !== '' && str_starts_with($uriPath, $basePath)) {
            $uriPath = substr($uriPath, strlen($basePath));
        }

        return trim($uriPath, '/');
    }
}
