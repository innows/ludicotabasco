<?php

/**
 * Controlador de Subcategorías - Panel de Administración
 * Sistema CMS + Catálogo Web
 */

namespace Admin\Controllers;

class SubCategoriaController
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

        $uploadDir = __DIR__ . '/../uploads/subcategorias/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('subcategoria_', true) . '.' . strtolower($extension);
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
            $conditions = ['slug_subcategoria' => $slug];
            if ($ignoreId > 0) {
                $conditions['id[!]'] = $ignoreId;
            }
            $exists = $this->db->has('subcategorias', $conditions);
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
        $subcategorias = $this->db->select('subcategorias', '*', [
            'estado' => 1,
            'ORDER' => ['Subcategoria_ID' => 'DESC']
        ]);

        $subcategorias = array_map(function ($subcategoria) {
            $subcategoria['imagen_url'] = !empty($subcategoria['imagen']) ? 'uploads/subcategorias/' . $subcategoria['imagen'] : null;
            return $subcategoria;
        }, $subcategorias);

        $this->sendJson(['success' => true, 'data' => $subcategorias]);
    }

    public function obtener()
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $subcategoria = $this->db->get('subcategorias', '*', ['Subcategoria_ID' => $id, 'estado' => 1]);
        if (!$subcategoria) {
            $this->sendJson(['success' => false, 'message' => 'Subcategoría no encontrada'], 404);
        }

        $subcategoria['imagen_url'] = !empty($subcategoria['imagen']) ? 'uploads/subcategorias/' . $subcategoria['imagen'] : null;
        $this->sendJson(['success' => true, 'data' => $subcategoria]);
    }

    public function guardar()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $id = (int)($_POST['Subcategoria_ID'] ?? 0);
        $nombre = $this->sanitize($_POST['nombre'] ?? '');
        $slug = $this->sanitize($_POST['slug_subcategoria'] ?? '');

        if (empty($nombre)) {
            $this->sendJson(['success' => false, 'message' => 'El nombre es obligatorio'], 422);
        }

        if (empty($slug)) {
            $slug = $this->generateSlug($nombre);
        }

        $slug = $this->generateUniqueSlug($slug, $id);
        $data = [
            'Subcategoria' => $nombre,
            'slug_subcategoria' => $slug,
            'estado' => 1
        ];

        if (!empty($_FILES['imagen']['name'])) {
            $imagen = $this->uploadImage($_FILES['imagen']);
            if ($imagen) {
                $data['imagen'] = $imagen;
            }
        }

        if ($id > 0) {
            $subcategoria = $this->db->get('subcategorias', '*', ['Subcategoria_ID' => $id]);
            if (!$subcategoria) {
                $this->sendJson(['success' => false, 'message' => 'Subcategoría no encontrada'], 404);
            }

            if (empty($data['imagen']) && !empty($subcategoria['imagen'])) {
                unset($data['imagen']);
            }

            $this->db->update('subcategorias', $data, ['Subcategoria_ID' => $id]);
            $this->sendJson(['success' => true, 'message' => 'Subcategoría actualizada correctamente']);
        }

        //$data['fecha_creacion'] = date('Y-m-d H:i:s');
        $this->db->insert('subcategorias', $data);
        $this->sendJson(['success' => true, 'message' => 'Subcategoría creada correctamente']);
    }

    public function eliminar()
    {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $subcategoria = $this->db->get('subcategorias', '*', ['Subcategoria_ID' => $id]);
        if (!$subcategoria) {
            $this->sendJson(['success' => false, 'message' => 'Subcategoría no encontrada'], 404);
        }

        $this->db->update('subcategorias', ['estado' => 0], ['Subcategoria_ID' => $id]);
        $this->sendJson(['success' => true, 'message' => 'Subcategoría eliminada correctamente']);
    }
}
