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

    private const FIELDS = [
        'nombre_sitio',
        'descripcion',
        'email',
        'telefono',
        'telefono_ventas',
        'whatsapp',
        'direccion',
        'horario',
        'facebook',
        'twitter',
        'instagram',
        'tiktok',
        'google_maps',
    ];

    public function index(): array|string
    {
        $config = $this->db->get('configuracion', '*', ['id' => 1]);

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
            $data = [];
            foreach (self::FIELDS as $field) {
                $data[$field] = trim((string) ($_POST[$field] ?? ''));
            }
            $data['fecha_actualizacion'] = date('Y-m-d H:i:s');

            if ($config) {
                $this->db->update('configuracion', $data, ['id' => 1]);
            } else {
                $this->db->insert('configuracion', $data + ['id' => 1]);
            }

            $_SESSION['message'] = ['type' => 'success', 'text' => 'Configuración guardada'];
            return 'admin/configuracion'; // el router arma la URL con baseUrl
        }

        $message = $_SESSION['message'] ?? null;
        unset($_SESSION['message']); // flash: se muestra una sola vez

        return ['config' => $config, 'message' => $message];
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
            'no_whatsapp' => $_POST['no-whatsapp'] ?? '',
            'whatsapp' => $_POST['whatsapp'] ?? '',
            'direccion' => $_POST['direccion'] ?? '',
            'horario' => $_POST['horario'] ?? '',
            'facebook' => $_POST['facebook'] ?? '',
            'twitter' => $_POST['twitter'] ?? '',
            'instagram' => $_POST['instagram'] ?? '',
            'tiktok' => $_POST['tiktok'] ?? '',
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
