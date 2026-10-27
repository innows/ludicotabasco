<?php

namespace Admin\Controllers;

class LogosController
{
    private const TABLE = 'tbl_logosBussines';
    private const MAX_IMAGE_SIZE = 5242880;

    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    private function sendJson(array $data, int $status = 200): void
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function normalizeLogo(array $logo): array
    {
        $filename = $logo['Logo_url'] ?? '';

        return [
            'id' => (int) $logo['Cliente_ID'],
            'nombre' => (string) ($logo['Nombre'] ?? ''),
            'imagen_url' => $filename !== ''
                ? rawurlencode(basename($filename))
                : null,
        ];
    }

    public function list(): void
    {
        $logos = $this->db->select(self::TABLE, ['Cliente_ID', 'Nombre', 'Logo_url'], [
            'ORDER' => ['Cliente_ID' => 'DESC'],
        ]);

        $this->sendJson([
            'success' => true,
            'data' => array_map([$this, 'normalizeLogo'], $logos),
        ]);
    }

    public function obtener(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $logo = $this->db->get(self::TABLE, ['Cliente_ID', 'Nombre', 'Logo_url'], [
            'Cliente_ID' => $id,
        ]);
        if (!$logo) {
            $this->sendJson(['success' => false, 'message' => 'Logo no encontrado'], 404);
        }

        $this->sendJson(['success' => true, 'data' => $this->normalizeLogo($logo)]);
    }

    private function uploadImage(array $file): string
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $this->sendJson(['success' => false, 'message' => 'No se pudo recibir la imagen'], 400);
        }

        if (($file['size'] ?? 0) <= 0 || $file['size'] > self::MAX_IMAGE_SIZE) {
            $this->sendJson(['success' => false, 'message' => 'La imagen debe pesar máximo 5 MB'], 422);
        }

        $imageInfo = @getimagesize($file['tmp_name']);
        $mime = $imageInfo['mime'] ?? '';
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
        ];
        if (!isset($extensions[$mime])) {
            $this->sendJson(['success' => false, 'message' => 'Formato de imagen no permitido'], 422);
        }

        $uploadDirectory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads'
            . DIRECTORY_SEPARATOR . 'logos' . DIRECTORY_SEPARATOR;
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
            $this->sendJson(['success' => false, 'message' => 'No se pudo crear el directorio de imágenes'], 500);
        }

        $filename = uniqid('logo_', true) . '.' . $extensions[$mime];
        if (!move_uploaded_file($file['tmp_name'], $uploadDirectory . $filename)) {
            $this->sendJson(['success' => false, 'message' => 'No se pudo guardar la imagen'], 500);
        }

        return $filename;
    }

    private function removeImage(?string $filename): void
    {
        if (!$filename || basename($filename) !== $filename) {
            return;
        }

        $path = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads'
            . DIRECTORY_SEPARATOR . 'logos' . DIRECTORY_SEPARATOR . $filename;
        if (is_file($path) && !unlink($path)) {
            error_log('No se pudo eliminar la imagen del logo: ' . $path);
        }
    }

    public function guardar(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $id = (int) ($_POST['id'] ?? 0);
        $nombre = trim((string) ($_POST['nombre'] ?? ''));
        $nombreLength = function_exists('mb_strlen') ? mb_strlen($nombre, 'UTF-8') : strlen($nombre);
        if ($nombre === '') {
            $this->sendJson(['success' => false, 'message' => 'El nombre es obligatorio'], 422);
        }
        if ($nombreLength > 255) {
            $this->sendJson(['success' => false, 'message' => 'El nombre no debe superar 255 caracteres'], 422);
        }

        $existing = null;
        if ($id > 0) {
            $existing = $this->db->get(self::TABLE, ['Cliente_ID', 'Logo_url'], ['Cliente_ID' => $id]);
            if (!$existing) {
                $this->sendJson(['success' => false, 'message' => 'Logo no encontrado'], 404);
            }
        }

        $hasImage = isset($_FILES['imagen']) && ($_FILES['imagen']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
        if (!$existing && !$hasImage) {
            $this->sendJson(['success' => false, 'message' => 'La imagen es obligatoria'], 422);
        }

        $data = [
            'Nombre' => $nombre,
            'Estado' => 1,
        ];
        if ($hasImage) {
            $data['Logo_url'] = $this->uploadImage($_FILES['imagen']);
        }

        if ($existing) {
            $this->db->update(self::TABLE, $data, ['Cliente_ID' => $id]);
            if (isset($data['Logo_url'])) {
                $this->removeImage($existing['Logo_url'] ?? null);
            }
            $this->sendJson(['success' => true, 'message' => 'Logo actualizado correctamente']);
        }

        $this->db->insert(self::TABLE, $data);
        $this->sendJson(['success' => true, 'message' => 'Logo creado correctamente']);
    }

    public function eliminar(): void
    {
        $id = (int) ($_POST['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $logo = $this->db->get(self::TABLE, ['Cliente_ID', 'Logo_url'], ['Cliente_ID' => $id]);
        if (!$logo) {
            $this->sendJson(['success' => false, 'message' => 'Logo no encontrado'], 404);
        }

        $this->db->delete(self::TABLE, ['Cliente_ID' => $id]);
        $this->removeImage($logo['Logo_url'] ?? null);
        $this->sendJson(['success' => true, 'message' => 'Logo eliminado correctamente']);
    }
}
