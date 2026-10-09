<?php

declare(strict_types=1);

namespace App\Controller;

/** Gestiona la sesión del panel de administración. */
final class AuthController
{
    public function __construct(private readonly object $database)
    {
    }

    public function attempt(array $input): array
    {
        $email = trim((string) ($input['username'] ?? $input['email'] ?? ''));
        $password = (string) ($input['password'] ?? '');

        if ($email === '' || $password === '') {
            return ['success' => false, 'message' => 'Completa tu correo y contraseña.', 'status' => 422];
        }

        $admin = $this->database->get('administradores', ['id', 'username', 'password', 'nombre', 'email'], [
            'email' => $email,
            'estado' => 1,
        ]);

        if (!$admin || !password_verify($password, (string) $admin['password'])) {
            return ['success' => false, 'message' => 'Correo o contraseña incorrectos.', 'status' => 401];
        }

        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_user'] = (string) $admin['username'];
        $_SESSION['admin_name'] = (string) $admin['nombre'];
        $_SESSION['admin_email'] = (string) ($admin['email'] ?? '');
        $_SESSION['last_activity'] = time();

        $this->database->update('administradores', ['ultimo_login' => date('Y-m-d H:i:s')], ['id' => $admin['id']]);

        return ['success' => true, 'status' => 200];
    }

    public static function loggedIn(): bool
    {
        return isset($_SESSION['admin_id']) && (int) $_SESSION['admin_id'] > 0;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
        }
        session_destroy();
    }
}
