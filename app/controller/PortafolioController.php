<?php

/**
 * Controlador de Portafolio - Panel de Administración
 * Sistema CMS + Catálogo Web
 */

namespace Admin\Controllers;

class PortafolioController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function index()
    {
        $twig = new \Twig\Environment(new \Twig\Loader\FilesystemLoader(__DIR__ . '/../views'));
        $twig->addGlobal('ADMIN_URL', ADMIN_URL);
        echo $twig->render('portafolio.twig');
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

    private function uploadImage($file)
    {
        if (empty($file['name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $uploadDir = __DIR__ . '/../uploads/portafolio/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!in_array($extension, $allowedExtensions)) {
            return null;
        }

        $filename = uniqid('portafolio_', true) . '.jpg'; // Siempre guardar como JPG para optimización
        $target = $uploadDir . $filename;

        // Crear imagen desde el archivo subido
        $imageInfo = getimagesize($file['tmp_name']);
        if (!$imageInfo) {
            return null;
        }

        $mime = $imageInfo['mime'];
        switch ($mime) {
            case 'image/jpeg':
                $sourceImage = imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'image/png':
                $sourceImage = imagecreatefrompng($file['tmp_name']);
                break;
            case 'image/gif':
                $sourceImage = imagecreatefromgif($file['tmp_name']);
                break;
            default:
                return null;
        }

        if (!$sourceImage) {
            return null;
        }

        $originalWidth = imagesx($sourceImage);
        $originalHeight = imagesy($sourceImage);

        // Calcular nuevo tamaño manteniendo proporción, máximo 440x440
        $maxSize = 440;
        $ratio = min($maxSize / $originalWidth, $maxSize / $originalHeight);
        $newWidth = round($originalWidth * $ratio);
        $newHeight = round($originalHeight * $ratio);

        // Crear nueva imagen redimensionada
        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

        // Mantener transparencia para PNG/GIF
        if ($mime === 'image/png' || $mime === 'image/gif') {
            imagealphablending($resizedImage, false);
            imagesavealpha($resizedImage, true);
            $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
            imagefill($resizedImage, 0, 0, $transparent);
        }

        imagecopyresampled($resizedImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

        // Comprimir y guardar como JPG
        $quality = 90; // Calidad inicial
        do {
            ob_start();
            imagejpeg($resizedImage, null, $quality);
            $imageData = ob_get_clean();
            $fileSize = strlen($imageData);
            $quality -= 5;
        } while ($fileSize > 1024 * 1024 && $quality >= 50); // Máximo 1MB, calidad mínima 50

        if (file_put_contents($target, $imageData)) {
            imagedestroy($sourceImage);
            imagedestroy($resizedImage);
            return $filename;
        }

        imagedestroy($sourceImage);
        imagedestroy($resizedImage);
        return null;
    }

    public function list()
    {
        $portafolios = $this->db->select('portafolio', '*', [
            'Activo' => 1,
            'ORDER' => ['Portafolio_ID' => 'DESC']
        ]);

        $portafolios = array_map(function ($item) {
            $item['imagen_url'] = !empty($item['img_portafolio']) ? 'uploads/portafolio/' . $item['img_portafolio'] : null;
            return $item;
        }, $portafolios);

        $this->sendJson(['success' => true, 'data' => $portafolios]);
    }

    public function obtener()
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $portafolio = $this->db->get('portafolio', '*', ['Portafolio_ID' => $id, 'Activo' => 1]);
        if (!$portafolio) {
            $this->sendJson(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $portafolio['imagen_url'] = !empty($portafolio['img_portafolio']) ? 'uploads/portafolio/' . $portafolio['img_portafolio'] : null;
        $this->sendJson(['success' => true, 'data' => $portafolio]);
    }

    public function guardar()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }
        $id = (int)($_POST['Portafolio_ID'] ?? 0);
        $titulo = sanitize($_POST['titulo'] ?? '');
        $descripcion = sanitize($_POST['descripcion'] ?? '');
        $fechaServicio = sanitize($_POST['fecha_servicio'] ?? '');
        $nombreCliente = sanitize($_POST['nombre_cliente'] ?? '');

        if (empty($titulo)) {
            $this->sendJson(['success' => false, 'message' => 'El título es obligatorio'], 422);
        }

        // Edición de registro existente
        if ($id > 0) {
            $data = [
                'Titulo' => $titulo,
                'Descripcion' => $descripcion,
                'Fecha_Servicio' => $fechaServicio,
                'Nombre_Cliente' => $nombreCliente,
                'Activo' => 1
            ];

            if (!empty($_FILES['img_portafolio']['name'])) {
                $imagen = $this->uploadImage($_FILES['img_portafolio']);
                if ($imagen) {
                    $data['img_portafolio'] = $imagen;
                }
            }

            $existing = $this->db->get('portafolio', '*', ['Portafolio_ID' => $id]);
            if (!$existing) {
                $this->sendJson(['success' => false, 'message' => 'Registro no encontrado'], 404);
            }

            if (empty($data['img_portafolio']) && !empty($existing['img_portafolio'])) {
                unset($data['img_portafolio']);
            }

            $this->db->update('portafolio', $data, ['Portafolio_ID' => $id]);

            // Si se enviaron archivos desde Dropzone para agregar a la galería, guardarlos en galeriaPortafolio
            if (!empty($_FILES['img_portafolio']) && is_array($_FILES['img_portafolio']['name'])) {
                $files = $_FILES['img_portafolio'];
                $fileCount = count($files['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    $file = [
                        'name' => $files['name'][$i],
                        'type' => $files['type'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'error' => $files['error'][$i],
                        'size' => $files['size'][$i]
                    ];
                    $imagen = $this->uploadImage($file);
                    if ($imagen) {
                        $this->db->insert('galeriaPortafolio', [
                            'Portafolio_ID' => $id,
                            'Imagen' => $imagen,
                            'Activo' => 1
                        ]);
                    }
                }
            }

            $this->sendJson(['success' => true, 'message' => 'Portafolio actualizado correctamente']);
        }

        // Creación de nuevo registro: procesar Dropzone primero y asignar la primera imagen como principal si no hay imagen principal subida
        $mainImage = null;
        // Si se envió una imagen principal convencional (input file)
        if (!empty($_FILES['img_portafolio']['name']) && !is_array($_FILES['img_portafolio']['name'])) {
            $mainImage = $this->uploadImage($_FILES['img_portafolio']);
        }

        $uploadedImages = [];
        // Procesar archivos enviados por Dropzone (img_portafolio[])
        if (!empty($_FILES['img_portafolio']) && is_array($_FILES['img_portafolio']['name'])) {
            $files = $_FILES['img_portafolio'];
            $fileCount = count($files['name']);
            for ($i = 0; $i < $fileCount; $i++) {
                if (empty($files['name'][$i])) continue;
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
                $imagen = $this->uploadImage($file);
                if ($imagen) {
                    $uploadedImages[] = $imagen;
                }
            }
        }

        // Si no hay imagen principal pero sí imágenes subidas por Dropzone, usar la primera como principal
        if (empty($mainImage) && count($uploadedImages) > 0) {
            $mainImage = $uploadedImages[0];
        }

        // Insertar registro principal
        $insertData = [
            'Titulo' => $titulo,
            'Descripcion' => $descripcion,
            'Fecha_Servicio' => $fechaServicio,
            'Nombre_Cliente' => $nombreCliente,
            'Activo' => 1
        ];
        if ($mainImage) {
            $insertData['img_portafolio'] = $mainImage;
        }

        $this->db->insert('portafolio', $insertData);
        $newId = $this->db->id();

        // Guardar todas las imágenes subidas por Dropzone en la galería
        foreach ($uploadedImages as $imagen) {
            $this->db->insert('galeriaPortafolio', [
                'Portafolio_ID' => $newId,
                'Imagen' => $imagen,
                'Activo' => 1
            ]);
        }

        $this->sendJson(['success' => true, 'message' => 'Portafolio creado correctamente']);
    }

    public function eliminar()
    {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID inválido'], 400);
        }

        $portafolio = $this->db->get('portafolio', '*', ['Portafolio_ID' => $id]);
        if (!$portafolio) {
            $this->sendJson(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $this->db->update('portafolio', ['Activo' => 0], ['Portafolio_ID' => $id]);
        $this->sendJson(['success' => true, 'message' => 'Registro eliminado correctamente']);
    }

    public function uploadGalleryImage()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $portafolioId = (int)($_POST['portafolio_id'] ?? 0);
        if ($portafolioId <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID de portafolio inválido'], 422);
        }

        if (empty($_FILES['img_galeria']['name']) || $_FILES['img_galeria']['error'] !== UPLOAD_ERR_OK) {
            $this->sendJson(['success' => false, 'message' => 'No se recibió ninguna imagen válida'], 422);
        }

        $imagen = $this->uploadImage($_FILES['img_galeria']);
        if (!$imagen) {
            $this->sendJson(['success' => false, 'message' => 'Error al subir la imagen'], 500);
        }

        $this->db->insert('galeriaPortafolio', [
            'Portafolio_ID' => $portafolioId,
            'Imagen' => $imagen,
            'Activo' => 1
        ]);

        $this->sendJson(['success' => true, 'message' => 'Imagen agregada a la galería correctamente']);
    }

    public function deleteGalleryImage()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $galeriaId = (int)($_POST['galeria_id'] ?? 0);
        if ($galeriaId <= 0) {
            $this->sendJson(['success' => false, 'message' => 'ID de galería inválido'], 422);
        }

        $galeria = $this->db->get('galeriaPortafolio', '*', ['Galeria_ID' => $galeriaId]);
        if (!$galeria) {
            $this->sendJson(['success' => false, 'message' => 'Imagen de galería no encontrada'], 404);
        }

        $this->db->update('galeriaPortafolio', ['Activo' => 0], ['Galeria_ID' => $galeriaId]);
        $this->sendJson(['success' => true, 'message' => 'Imagen eliminada correctamente']);
    }

    public function Perfil($id)
    {
        $portafolioId = (int)$id;
        if ($portafolioId <= 0) {
            die('ID de portafolio inválido');
        }

        $portafolio = $this->db->get('portafolio', '*', ['Portafolio_ID' => $portafolioId, 'Activo' => 1]);
        if (!$portafolio) {
            die('Portafolio no encontrado');
        }

        $galeria = $this->db->select('galeriaPortafolio', '*', [
            'Portafolio_ID' => $portafolioId,
            'Activo' => 1,
            'ORDER' => ['Galeria_ID' => 'DESC']
        ]) ?: [];

        $loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../views');
        $twig = new \Twig\Environment($loader, [
            'cache' => false,
            'debug' => true,
        ]);
        $twig->addGlobal('ADMIN_URL', ADMIN_URL);

        echo $twig->render('perfilportafolio.twig', [
            'Sistema' => 'SysPro CMS',
            'Nombre' => $_SESSION['admin_name'] ?? 'Administrador',
            'ADMIN_URL' => ADMIN_URL,
            'portafolio' => $portafolio,
            'galeria' => $galeria
        ]);
    }
}
