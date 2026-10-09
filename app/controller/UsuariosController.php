<?php

/**
 * Controlador de Usuarios - Panel de Administración
 * Sistema CMS + Catálogo Web
 */

namespace Admin\Controllers;

class UsuariosController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    private function isAjaxRequest()
    {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }

    private function getRequestData()
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') !== false) {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            return is_array($data) ? $data : [];
        }
        return $_POST;
    }

    private function sendJson($data, $status = 200)
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    /**
     * Mostrar vista de usuarios
     */
    public function index()
    {
        $loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../views');
        $twig = new \Twig\Environment($loader, [
            'cache' => false,
            'debug' => true,
        ]);
        $twig->addGlobal('ADMIN_URL', ADMIN_URL);

        echo $twig->render('usuarios.twig', [
            'Sistema' => 'SysPro CMS',
            'Nombre' => $_SESSION['admin_name'] ?? 'Administrador'
        ]);
    }

    /**
     * Obtener lista de usuarios (para la tabla)
     */
    public function list()
    {
        $usuarios = $this->db->select('administradores', [
            'id',
            'username',
            'nombre',
            'email',
            'rol',
            'estado',
            'fecha_creacion'
        ], [
            'ORDER' => ['id' => 'DESC']
        ]);

        $data = array_map(function ($usuario) {
            return [
                'UsuarioID' => $usuario['id'],
                'username' => $usuario['username'],
                'Nombre' => $usuario['nombre'],
                'Correo' => $usuario['email'],
                'Telefono' => '',
                'rol' => $usuario['rol'],
                'Activo' => ($usuario['estado'] === 'activo') ? 1 : 0,
                'fecha_creacion' => $usuario['fecha_creacion']
            ];
        }, $usuarios);

        $this->sendJson(['success' => true, 'data' => $data]);
    }

    /**
     * DataTable endpoint para listado de usuarios
     */
    public function LstUsuarios()
    {
        $usuarios = $this->db->select('administradores', [
            'id',
            'username',
            'nombre',
            'email',
            'rol',
            'estado',
            'fecha_creacion'
        ], [
            'ORDER' => ['id' => 'DESC']
        ]);

        $data = array_map(function ($usuario) {
            return [
                'UsuarioID' => $usuario['id'],
                'username' => $usuario['username'],
                'Nombre' => $usuario['nombre'],
                'Correo' => $usuario['email'],
                'Telefono' => '',
                'rol' => $usuario['rol'],
                'Activo' => ($usuario['estado'] === 'activo') ? 1 : 0,
                'fecha_creacion' => $usuario['fecha_creacion']
            ];
        }, $usuarios);

        $this->sendJson([
            'draw' => $_GET['draw'] ?? 0,
            'recordsTotal' => count($data),
            'recordsFiltered' => count($data),
            'data' => $data
        ]);
    }

    /**
     * Obtener datos de un usuario específico
     */
    public function GetUser()
    {
        $userid = (int)($_GET['userid'] ?? 0);

        if ($userid <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID de usuario inválido'], 400);
        }

        $usuario = $this->db->get('administradores', [
            'id',
            'username',
            'nombre',
            'email',
            'rol',
            'estado'
        ], ['id' => $userid]);

        if (!$usuario) {
            $this->sendJson(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        $response = [
            'UsuarioID' => $usuario['id'],
            'username' => $usuario['username'],
            'nombre' => $usuario['nombre'],
            'correo' => $usuario['email'],
            'rol' => $usuario['rol'],
            'Activo' => ($usuario['estado'] === 'activo') ? 1 : 0
        ];

        $this->sendJson(['success' => true, 'objResponse' => [$response]]);
    }

    /**
     * Crear nuevo usuario
     */
    public function Crear()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $data = $this->getRequestData();

        // Validar campos obligatorios
        $nombre = trim($data['nombre'] ?? '');
        $correo = trim($data['correo'] ?? '');
        $password = $data['passwrd'] ?? '';

        if (empty($nombre)) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'El nombre es obligatorio'], 422);
        }

        if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'El correo es obligatorio y debe ser válido'], 422);
        }

        if (empty($password) || strlen($password) < 6) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'La contraseña debe tener al menos 6 caracteres'], 422);
        }

        // Verificar si el correo ya existe
        $exists = $this->db->has('administradores', ['email' => $correo]);
        if ($exists) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'El correo ya está registrado'], 409);
        }

        // Crear usuario
        $usuarioData = [
            'username' => explode('@', $correo)[0] . '_' . uniqid(),
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'nombre' => $nombre,
            'email' => $correo,
            'rol' => $data['rol'] ?? '2',
            'estado' => 1,
            'fecha_creacion' => date('Y-m-d H:i:s')
        ];

        $this->db->insert('administradores', $usuarioData);
        $usuarioId = $this->db->id();

        if (!$usuarioId) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'Error al crear el usuario'], 500);
        }

        $this->sendJson(['success' => true, 'error' => false, 'message' => 'Usuario creado correctamente', 'data' => ['id' => $usuarioId]]);
    }

    /**
     * Actualizar usuario
     */
    public function Actualizar()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $data = $this->getRequestData();

        $usuarioID = (int)($data['usuarioID'] ?? 0);
        $nombre = trim($data['nombre'] ?? '');
        $correo = trim($data['correo'] ?? '');

        if ($usuarioID <= 0) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'ID de usuario inválido'], 422);
        }

        if (empty($nombre)) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'El nombre es obligatorio'], 422);
        }

        if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'El correo es obligatorio y debe ser válido'], 422);
        }

        // Verificar que el usuario existe
        $usuario = $this->db->get('administradores', '*', ['id' => $usuarioID]);
        if (!$usuario) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'Usuario no encontrado'], 404);
        }

        // Verificar que el correo no esté en uso por otro usuario
        $emailExists = $this->db->has('administradores', [
            'email' => $correo,
            'id[!]' => $usuarioID
        ]);
        if ($emailExists) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'El correo ya está registrado'], 409);
        }

        // Actualizar usuario
        $updateData = [
            'nombre' => $nombre,
            'email' => $correo,
            'rol' => $data['rol'] ?? '0',
            'estado' => 1
        ];

        $this->db->update('administradores', $updateData, ['id' => $usuarioID]);

        $this->sendJson(['success' => true, 'error' => false, 'message' => 'Usuario actualizado correctamente']);
    }

    /**
     * Desactivar/Activar usuario
     */
    public function Desactivar()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $data = $this->getRequestData();

        $usuarioID = (int)($data['usuarioID'] ?? 0);
        $activo = isset($data['1']) ? 0 : 1; // Si viene 1, se desactiva (0), si no viene, se activa (1)

        if ($usuarioID <= 0) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'ID de usuario inválido'], 422);
        }

        // Verificar que el usuario existe
        $usuario = $this->db->get('administradores', '*', ['id' => $usuarioID]);
        if (!$usuario) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'Usuario no encontrado'], 404);
        }

        // No permitir desactivar al último admin
        if (!$activo) {
            $adminCount = $this->db->count('administradores', [
                'rol' => '1',
                'estado' => '1'
            ]);

            if ($adminCount <= 1 && $usuario['rol'] === '1') {
                $this->sendJson(['success' => false, 'error' => true, 'message' => 'No se puede desactivar el último administrador'], 409);
            }
        }

        // Actualizar estado
        $this->db->update('administradores', [
            'estado' => $activo ? '1' : '0'
        ], ['id' => $usuarioID]);

        $this->sendJson(['success' => true, 'error' => false, 'message' => 'Usuario ' . ($activo ? 'activado' : 'desactivado') . ' correctamente']);
    }

    /**
     * Actualizar contraseña
     */
    public function UpdPass()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $data = $this->getRequestData();

        $usuarioID = (int)($data['usuarioID'] ?? 0);
        $password = $data['passwrd'] ?? '';

        if ($usuarioID <= 0) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'ID de usuario inválido'], 422);
        }

        if (empty($password) || strlen($password) < 6) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'La contraseña debe tener al menos 6 caracteres'], 422);
        }

        // Verificar que el usuario existe
        $usuario = $this->db->get('administradores', '*', ['id' => $usuarioID]);
        if (!$usuario) {
            $this->sendJson(['success' => false, 'error' => true, 'message' => 'Usuario no encontrado'], 404);
        }

        // Actualizar contraseña
        $this->db->update('administradores', [
            'password' => password_hash($password, PASSWORD_BCRYPT)
        ], ['id' => $usuarioID]);

        $this->sendJson(['success' => true, 'error' => false, 'message' => 'Contraseña actualizada correctamente']);
    }
}
