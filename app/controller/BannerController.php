<?php

/**
 * Controlador de Banners - Panel de Administración
 * Sistema CMS + Catálogo Web
 */

namespace Admin\Controllers;

class BannerController
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

    private function uploadImage($file)
    {
        if (empty($file['name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $uploadDir = __DIR__ . '/../uploads/banners/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('banner_', true) . '.' . strtolower($extension);
        $target = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $target)) {
            return $filename;
        }

        return null;
    }

    public function index()
    {
        $loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../views');
        $twig = new \Twig\Environment($loader, [
            'cache' => false,
            'debug' => true,
        ]);
        $twig->addGlobal('ADMIN_URL', ADMIN_URL);

        echo $twig->render('banner.twig', [
            'Sistema' => 'SysPro CMS',
            'Nombre' => $_SESSION['admin_name'] ?? 'Administrador',
            'ADMIN_URL' => ADMIN_URL,
            'BASE_URL' => BASE_URL,
        ]);
    }

    public function list()
    {
        $banners = $this->db->select('tbl_banner', '*', [
            'ORDER' => ['banner_id' => 'DESC']
        ]);

        $banners = array_map(function ($banner) {
            $banner['imagen_url'] = !empty($banner['imagen']) ? 'uploads/banners/' . $banner['imagen'] : null;
            return $banner;
        }, $banners);

        $this->sendJson(['success' => true, 'data' => $banners]);
    }

    public function obtener()
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $banner = $this->db->get('tbl_banner', '*', ['banner_id' => $id]);
        if (!$banner) {
            $this->sendJson(['success' => false, 'message' => 'Banner no encontrado'], 404);
        }

        $banner['imagen_url'] = !empty($banner['imagen']) ? 'uploads/banners/' . $banner['imagen'] : null;
        $this->sendJson(['success' => true, 'data' => $banner]);
    }

    public function guardar()
    {
        $data = $this->getRequestData();
        $id = isset($data['Banner_ID']) ? (int)$data['Banner_ID'] : 0;

        $saveData = [
            'titulo' => sanitize($data['titulo'] ?? ''),
            'subtitulo' => sanitize($data['subtitulo'] ?? ''),
            'titulo_boton' => sanitize($data['titulo_boton'] ?? ''),
            'url_boton' => sanitize($data['url_boton'] ?? ''),
            'activo' => 1, // Siempre activo al guardar
        ];

        if (!empty($_FILES['imagen']['name'])) {
            $uploadedImage = $this->uploadImage($_FILES['imagen']);
            if ($uploadedImage) {
                $saveData['imagen'] = $uploadedImage;
            }
        }

        if ($id > 0) {
            $existing = $this->db->get('tbl_banner', '*', ['banner_id' => $id]);
            if (!$existing) {
                $this->sendJson(['success' => false, 'message' => 'Banner no encontrado'], 404);
            }

            if (empty($saveData['imagen']) && !empty($existing['imagen'])) {
                unset($saveData['imagen']);
            }

            $this->db->update('tbl_banner', $saveData, ['banner_id' => $id]);
            $this->sendJson(['success' => true, 'message' => 'Banner actualizado correctamente']);
        }


        $this->db->insert('tbl_banner', $saveData);
        $this->sendJson(['success' => true, 'message' => 'Banner creado correctamente']);
    }

    public function eliminar()
    {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $this->db->delete('tbl_banner', ['banner_id' => $id]);
        $this->sendJson(['success' => true, 'message' => 'Banner eliminado correctamente']);
    }
}
