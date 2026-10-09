<?php

/**
 * Controlador de Configuración - Panel de Administración
 * Sistema CMS + Catálogo Web
 */

namespace Admin\Controllers;

class ConfigController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function index()
    {
        $config = $this->db->get('configuracion', '*', ['id' => 1]);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'nombre_sitio' => $_POST['nombre_sitio'] ?? '',
                'descripcion' => $_POST['descripcion'] ?? '',
                'email' => $_POST['email'] ?? '',
                'telefono' => $_POST['telefono'] ?? '',
                'telefono_ventas' => $_POST['telefono_ventas'] ?? '',
                'whatsapp' => $_POST['whatsapp'] ?? '',
                'direccion' => $_POST['direccion'] ?? '',
                'horario' => $_POST['horario'] ?? '',
                'facebook' => $_POST['facebook'] ?? '',
                'twitter' => $_POST['twitter'] ?? '',
                'instagram' => $_POST['instagram'] ?? '',
                'google_maps' => $_POST['google_maps'] ?? '',
                'fecha_actualizacion' => date('Y-m-d H:i:s')
            ];

            if ($config) {
                $this->db->update('configuracion', $data, ['id' => 1]);
            } else {
                $data['id'] = 1;
                $this->db->insert('configuracion', $data);
            }

            $_SESSION['message'] = ['type' => 'success', 'text' => 'Configuración guardada'];
            header('Location: ' . ADMIN_URL . '/configuracion');
            exit;
        }

        $loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../views');
        $twig = new \Twig\Environment($loader, [
            'cache' => false,
            'debug' => true,
        ]);
        $twig->addGlobal('ADMIN_URL', ADMIN_URL);
        echo $twig->render('configuracion.twig', [
            'Sistema' => 'SysPro CMS',
            'Nombre' => $_SESSION['admin_name'] ?? 'Administrador',
            'config' => $config,
            'ADMIN_URL' => ADMIN_URL,
            'BASE_URL' => BASE_URL,
        ]);
    }

    public function guardar()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            exit;
        }

        $data = [
            'nombre_sitio' => $_POST['nombre_sitio'] ?? '',
            'descripcion' => $_POST['descripcion'] ?? '',
            'email' => $_POST['email'] ?? '',
            'telefono' => $_POST['telefono'] ?? '',
            'telefono_ventas' => $_POST['telefono_ventas'] ?? '',
            'whatsapp' => $_POST['whatsapp'] ?? '',
            'direccion' => $_POST['direccion'] ?? '',
            'horario' => $_POST['horario'] ?? '',
            'facebook' => $_POST['facebook'] ?? '',
            'twitter' => $_POST['twitter'] ?? '',
            'instagram' => $_POST['instagram'] ?? '',
            'google_maps' => $_POST['google_maps'] ?? '',
            'fecha_actualizacion' => date('Y-m-d H:i:s')
        ];

        $config = $this->db->get('configuracion', '*', ['id' => 1]);
        if ($config) {
            $this->db->update('configuracion', $data, ['id' => 1]);
        } else {
            $data['id'] = 1;
            $this->db->insert('configuracion', $data);
        }

        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Configuración guardada correctamente']);
        exit;
    }
}
