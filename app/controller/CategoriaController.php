<?php

/**
 * Controlador de Categorías - Panel de Administración
 * Sistema CMS + Catálogo Web
 */

namespace Admin\Controllers;

class CategoriaController
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

    private function sendJson($data, $status = 200)
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }
    private function sanitize($input)
    {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    private function uploadImage($file)
    {
        if (empty($file['name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $uploadDir = __DIR__ . '/../uploads/categorias/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('categoria_', true) . '.' . strtolower($extension);
        $target = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $target)) {
            return $filename;
        }

        return null;
    }

    private function generateUniqueSlug($slug, $ignoreId = 0)
    {
        $baseSlug = $slug;
        $suffix = 1;
        while (true) {
            $conditions = ['slug' => $slug];
            if ($ignoreId > 0) {
                $conditions['id[!]'] = $ignoreId;
            }
            $exists = $this->db->has('categorias', $conditions);
            if (!$exists) {
                return $slug;
            }
            $slug = $baseSlug . '-' . $suffix;
            $suffix++;
        }
    }

    private function generateSlug($string)
    {
        $slug = strtolower(trim($string));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }

    public function list()
    {
        $categorias = $this->db->select('categorias', '*', [
            'estado' => 1,
            'ORDER' => ['orden' => 'DESC', 'fecha_actualizacion' => 'DESC']
        ]);

        $categorias = array_map(function ($categoria) {
            $categoria['imagen_url'] = !empty($categoria['imagen']) ? 'uploads/categorias/' . $categoria['imagen'] : null;
            return $categoria;
        }, $categorias);

        $this->sendJson(['success' => true, 'data' => $categorias]);
    }

    public function obtener()
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $categoria = $this->db->get('categorias', '*', ['id' => $id, 'estado' => 1]);
        if (!$categoria) {
            $this->sendJson(['success' => false, 'message' => 'Categoría no encontrada'], 404);
        }

        $categoria['imagen_url'] = !empty($categoria['imagen']) ? 'uploads/categorias/' . $categoria['imagen'] : null;
        $this->sendJson(['success' => true, 'data' => $categoria]);
    }

    public function guardar()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $id = (int)($_POST['id'] ?? 0);
        $nombre = $this->sanitize($_POST['nombre'] ?? '');
        $descripcion = $this->sanitize($_POST['descripcion'] ?? '');
        $slug = $this->sanitize($_POST['slug'] ?? '');

        if (empty($nombre)) {
            $this->sendJson(['success' => false, 'message' => 'El nombre es obligatorio'], 422);
        }

        if (empty($slug)) {
            $slug = $this->generateSlug($nombre);
        }

        $slug = $this->generateUniqueSlug($slug, $id);
        $data = [
            'nombre' => $nombre,
            'slug' => $slug,
            'descripcion' => $descripcion,
            'estado' => 1,
            'orden' => 0,
            'fecha_actualizacion' => date('Y-m-d H:i:s')
        ];

        if (!empty($_FILES['imagen']['name'])) {
            $imagen = $this->uploadImage($_FILES['imagen']);
            if ($imagen) {
                $data['imagen'] = $imagen;
            }
        }

        if ($id > 0) {
            $categoria = $this->db->get('categorias', '*', ['id' => $id]);
            if (!$categoria) {
                $this->sendJson(['success' => false, 'message' => 'Categoría no encontrada'], 404);
            }

            if (empty($data['imagen']) && !empty($categoria['imagen'])) {
                unset($data['imagen']);
            }

            $this->db->update('categorias', $data, ['id' => $id]);
            $this->sendJson(['success' => true, 'message' => 'Categoría actualizada correctamente']);
        }

        $data['fecha_creacion'] = date('Y-m-d H:i:s');
        $this->db->insert('categorias', $data);
        $this->sendJson(['success' => true, 'message' => 'Categoría creada correctamente']);
    }

    public function eliminar()
    {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $categoria = $this->db->get('categorias', '*', ['id' => $id]);
        if (!$categoria) {
            $this->sendJson(['success' => false, 'message' => 'Categoría no encontrada'], 404);
        }

        $this->db->update('categorias', ['estado' => 0], ['id' => $id]);
        $this->sendJson(['success' => true, 'message' => 'Categoría eliminada correctamente']);
    }
}
