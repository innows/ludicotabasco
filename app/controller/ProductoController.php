<?php

/**
 * Controlador de Productos - Panel de Administración
 * Sistema CMS + Catálogo Web
 */

namespace Admin\Controllers;

class ProductoController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    //funcion para traer categorias y subcategorias para la vista de productos
    public function index()
    {
        $categorias = $this->db->select('categorias', '*', ['estado' => '1']);
        $subcategorias = $this->db->select('subcategorias', '*', ['estado' => '1']);


        return [
            'categorias' => $categorias,
            'subcategorias' => $subcategorias
        ];
    }

    public function list()
    {
        $productos = $this->db->query("SELECT p.*, c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id  ORDER BY p.fecha_creacion DESC")->fetchAll();

        $data = array_map(function ($producto) {
            return [
                'id' => $producto['id'],
                'sku' => $producto['sku'],
                'nombre' => $producto['nombre'],
                'precio' => $producto['precio'],
                'categoria' => $producto['categoria'],
                'estado' => $producto['estado'],
                'stock' => $producto['stock']
            ];
        }, $productos);

        $this->sendJson(['success' => true, 'data' => $data]);
    }

    public function nuevo()
    {
        // Obtener categorías
        $categorias = $this->db->select('categorias', '*', ['estado' => '1']);
        // Obtener subcategorías
        $subcategorias = $this->db->select('subcategorias', '*', ['estado' => '1']);

        // Procesar formulario
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

            // Validar datos básicos
            $nombre = trim($_POST['nombre'] ?? '');
            if (empty($nombre)) {
                $message = 'El nombre del producto es obligatorio';
                if ($isAjax) {
                    $this->sendJson(['success' => false, 'message' => $message], 422);
                } else {
                    $_SESSION['message'] = ['type' => 'error', 'text' => $message];
                    header('Location: ' . '/admonproductos');
                    exit;
                }
            }

            // Subir imagen principal
            $imagen = '';
            if (!empty($_FILES['imagen']['name'])) {
                $imagen = $this->uploadImage($_FILES['imagen'], 'productos');
            }

            // Subir información adicional
            $informacion_adicional = '';
            if (!empty($_FILES['informacion-adicional']['name'])) {
                $informacion_adicional = $this->uploadImage($_FILES['informacion-adicional'], 'productos');
            }

            // Preparar datos del producto
            $data = [
                'nombre' => $nombre,
                'slug' => $this->createSlug($nombre),
                'descripcion' => trim($_POST['descripcion'] ?? ''),
                'precio' => (float)($_POST['precio'] ?? 0),
                'precio_anterior' => !empty($_POST['precio_nuevo']) ? (float)$_POST['precio_nuevo'] : null,
                'categoria_id' => (int)($_POST['categoria_id'] ?? 0),
                'imagen' => $imagen,
                'sku' => trim($_POST['sku'] ?? ''),
                'stock' => (int)($_POST['stock'] ?? 0),
                'destacado' => isset($_POST['destacado']) ? 1 : 0,
                'informacion_adicional' => $informacion_adicional,
                'estado' => 1,
                'fecha_creacion' => date('Y-m-d H:i:s')
            ];

            // Insertar producto
            $this->db->insert('productos', $data);
            $productoId = $this->db->id();

            if (!$productoId) {
                $message = 'Error al crear el producto';
                if ($isAjax) {
                    $this->sendJson(['success' => false, 'message' => $message], 500);
                } else {
                    $_SESSION['message'] = ['type' => 'error', 'text' => $message];
                    header('Location: ' . '/admonproductos');
                    exit;
                }
            }
            // Procesar servicios
            if (!empty($_POST['servicios'])) {
                $servicios = json_decode($_POST['servicios'], true);
                if (!is_array($servicios)) {
                    $servicios = [];
                }

                foreach ($servicios as $servicioData) {
                    $servicioId = null;
                    $servicioNombre = trim($servicioData['text'] ?? '');
                    $isNewService = !empty($servicioData['new']);

                    if ($isNewService || !is_numeric($servicioData['id'])) {
                        if ($servicioNombre !== '') {
                            $servicioExistente = $this->db->get('servicios', 'Servicio_ID', [
                                'Nombre_Servicio' => $servicioNombre
                            ]);

                            if ($servicioExistente) {
                                $servicioId = (int)$servicioExistente;
                            } else {
                                $this->db->insert('servicios', [
                                    'Nombre_Servicio' => $servicioNombre,
                                    'Activo' => 1
                                ]);
                                $servicioId = $this->db->id();
                            }
                        }
                    } else {
                        $servicioId = (int)$servicioData['id'];
                        $servicioExistente = $this->db->get('servicios', 'Servicio_ID', [
                            'Servicio_ID' => $servicioId
                        ]);

                        if (!$servicioExistente && $servicioNombre !== '') {
                            $this->db->insert('servicios', [
                                'Nombre_Servicio' => $servicioNombre,
                                'Activo' => 1
                            ]);
                            $servicioId = $this->db->id();
                        }
                    }

                    if ($servicioId) {
                        $this->db->insert('servicios_productos', [
                            'Producto_ID' => $productoId,
                            'Servicio_ID' => $servicioId,
                            'Activo' => 1
                        ]);
                    }
                }
            }

            // Procesar galería
            if (!empty($_FILES['img_galeria']) && !empty($_FILES['img_galeria']['name'])) {
                $files = $_FILES['img_galeria'];
                $fileData = [];

                if (is_array($files['name'])) {
                    $fileCount = count($files['name']);
                    for ($i = 0; $i < $fileCount; $i++) {
                        if (empty($files['name'][$i])) {
                            continue;
                        }
                        $fileData[] = [
                            'name' => $files['name'][$i],
                            'type' => $files['type'][$i],
                            'tmp_name' => $files['tmp_name'][$i],
                            'error' => $files['error'][$i],
                            'size' => $files['size'][$i]
                        ];
                    }
                } else {
                    $fileData[] = $files;
                }

                foreach ($fileData as $file) {
                    $imgGaleria = $this->uploadImage($file, 'productos');
                    if ($imgGaleria) {
                        $this->db->insert('galeriaProductos', [
                            'Producto_ID' => $productoId,
                            'Img_Galeria' => $imgGaleria,
                            'Activo' => 1
                        ]);
                    }
                }
            }

            $message = 'Producto creado correctamente';
            if ($isAjax) {
                $this->sendJson(['success' => true, 'message' => $message]);
            } else {
                $_SESSION['message'] = ['type' => 'success', 'text' => $message];
                header('Location: ' .  '/admonproductos');
                exit;
            }
        }
    }

    public function editar($id = null)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            die('Método no soportado');
        }

        $productoId = (int)($_POST['producto_id'] ?? $id);
        if (!$productoId) {
            $this->sendJson(['success' => false, 'message' => 'ID de producto inválido'], 422);
        }

        $producto = $this->db->get('productos', '*', ['id' => $productoId]);
        if (!$producto) {
            $this->sendJson(['success' => false, 'message' => 'Producto no encontrado'], 404);
        }

        $data = [
            'nombre' => trim($_POST['nombre'] ?? ''),
            'descripcion' => trim($_POST['descripcion'] ?? ''),
            'precio' => (float)($_POST['precio'] ?? 0),
            'precio_anterior' => !empty($_POST['precio_anterior']) ? (float)$_POST['precio_anterior'] : null,
            'sku' => trim($_POST['sku'] ?? ''),
            'stock' => (int)($_POST['stock'] ?? 0),
            'categoria_id' => (int)($_POST['categoria_id'] ?? 0),
            'destacado' => isset($_POST['destacado']) ? 1 : 0,
            'estado' => $_POST['estado'] ?? '1',
            'fecha_actualizacion' => date('Y-m-d H:i:s')
        ];

        if (!empty($_FILES['imagen']['name'])) {
            $imagen = $this->uploadImage($_FILES['imagen'], 'productos');
            if ($imagen) {
                $data['imagen'] = $imagen;
            }
        }

        if (!empty($_FILES['informacion_adicional']['name'])) {
            $informacionAdicional = $this->uploadImage($_FILES['informacion_adicional'], 'productos');
            if ($informacionAdicional) {
                $data['informacion_adicional'] = $informacionAdicional;
            }
        }

        $this->db->update('productos', $data, ['id' => $productoId]);

        $this->sendJson(['success' => true, 'message' => 'Producto actualizado correctamente']);
    }

    public function eliminar($id = null)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $id === null) {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $productoId = (int)($_POST['id'] ?? $id);
        if (!$productoId) {
            $this->sendJson(['success' => false, 'message' => 'ID de producto inválido'], 422);
        }

        $producto = $this->db->get('productos', '*', ['id' => $productoId]);
        if (!$producto) {
            $this->sendJson(['success' => false, 'message' => 'Producto no encontrado'], 404);
        }

        if ($producto['estado'] === '0') {
            $this->sendJson(['success' => false, 'message' => 'El producto ya está inactivo'], 422);
        }

        $this->db->update('productos', ['estado' => '0'], ['id' => $productoId]);
        $this->sendJson(['success' => true, 'message' => 'Producto eliminado correctamente']);
    }

    public function perfil($id = null)
    {
        // 1. Si el enrutador no inyecta el ID, lo capturamos directamente de la URL actual de forma segura
        if (!$id) {
            $requestUri = $_SERVER['REQUEST_URI'] ?? '';
            if (preg_match('/id=([0-9]+)/', $requestUri, $matches)) {
                $id = $matches[1];
            }
        }

        $idProducto = (int) $id;

      

        if ($idProducto <= 0) {
            die('ID de producto inválido');
        }

        // 2. Obtener producto usando Medoo
        $producto = $this->db->get('productos', '*', ['id' => $idProducto]);

        if (!$producto) {
            die('Producto no encontrado');
        }

        // 3. Obtener categoría principal (evitando null)
        $categoria = $this->db->get('categorias', '*', ['id' => $producto['categoria_id'] ?? 0]) ?: [];

        // 4. Obtener categorías activas para el modal de edición
        $categorias = $this->db->select('categorias', '*', ['estado' => '1']) ?: [];

        // 5. Obtener servicios asociados (Medoo maneja consultas directas de forma segura)
        $servicios = $this->db->query(
            "SELECT s.Servicio_ID, s.Nombre_Servicio 
             FROM servicios s
             LEFT JOIN servicios_productos sp ON s.Servicio_ID = sp.Servicio_ID
             WHERE sp.Producto_ID = :idProducto AND sp.Activo = 1",
            [':idProducto' => $idProducto]
        )->fetchAll(\PDO::FETCH_ASSOC) ?: [];

        // 6. Obtener galería con Medoo
        $galeria = $this->db->select('galeriaProductos', '*', [
            'Producto_ID' => $idProducto,
            'Activo'      => 1
        ]) ?: [];

      
        return [
           
            'producto'   => $producto,
            'categoria'  => $categoria,
            'categorias' => $categorias,
            'servicios'  => $servicios,
            'galeria'    => $galeria,
           
        ];
    }

    private function sendJson($data, $status = 200)
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    private function createSlug($string)
    {
        $string = strtolower($string);
        $string = preg_replace('/[^a-z0-9\s-]/', '', $string);
        $string = preg_replace('/[\s-]+/', '-', $string);
        $string = trim($string, '-');
        return $string;
    }

    private function uploadImage($file, $subfolder = 'productos')
    {
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $uploadDir = __DIR__ . '/../uploads/' . $subfolder . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = pathinfo($file['name'], PATHINFO_FILENAME);
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!in_array($extension, $allowedExtensions)) {
            return null;
        }

        $filename = uniqid($subfolder . '_', true) . '.jpg'; // Siempre guardar como JPG para optimización
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

        // Para productos, mantener proporción pero limitar tamaño
        $maxWidth = 800;
        $maxHeight = 600;
        $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight, 1);
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

    private function deleteImage($filename, $subfolder = 'productos')
    {
        $filePath = __DIR__ . '/../uploads/' . $subfolder . '/' . $filename;
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    private function deleteGalleryFile($filename)
    {
        $filePath = __DIR__ . '/../uploads/productos/' . $filename;
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $galeria = $this->db->get('galeriaProductos', '*', ['Img_Galeria' => $filename]);
        if ($galeria) {
            $this->db->delete('galeriaProductos', ['Galeria_ID' => $galeria['Galeria_ID']]);
        }
    }

    public function obtenerServiciosProducto($id)
    {
        $servicios = $this->db->query(
            "SELECT sp.ServProducto_ID, s.Servicio_ID, s.Nombre_Servicio
             FROM servicios s
             INNER JOIN servicios_productos sp
                ON s.Servicio_ID = sp.Servicio_ID
             WHERE sp.Producto_ID = $id
             AND sp.Activo = 1"
        )->fetchAll() ?: [];

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($servicios);
        exit;
    }

    public function uploadGalleryImage()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $productoId = (int)($_POST['producto_id'] ?? 0);
        if (!$productoId) {
            $this->sendJson(['success' => false, 'message' => 'ID de producto inválido'], 422);
        }

        if (empty($_FILES['img_galeria']) || $_FILES['img_galeria']['error'] !== UPLOAD_ERR_OK) {
            $this->sendJson(['success' => false, 'message' => 'No se recibió ninguna imagen válida'], 422);
        }

        $imagen = $this->uploadImage($_FILES['img_galeria'], 'productos');
        if (!$imagen) {
            $this->sendJson(['success' => false, 'message' => 'Error al subir la imagen'], 500);
        }

        $this->db->insert('galeriaProductos', [
            'Producto_ID' => $productoId,
            'Img_Galeria' => $imagen,
            'Activo' => 1
        ]);

        $this->sendJson(['success' => true, 'message' => 'Imagen agregada correctamente']);
    }

    public function deleteGalleryImage()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $galeriaId = (int)($_POST['galeria_id'] ?? 0);
        if (!$galeriaId) {
            $this->sendJson(['success' => false, 'message' => 'ID de galería inválido'], 422);
        }

        $galeria = $this->db->get('galeriaProductos', '*', ['Galeria_ID' => $galeriaId]);
        if (!$galeria) {
            $this->sendJson(['success' => false, 'message' => 'Imagen no encontrada'], 404);
        }

        $this->deleteGalleryFile($galeria['Img_Galeria']);
        $this->sendJson(['success' => true, 'message' => 'Imagen eliminada correctamente']);
    }

    public function agregarServicioProducto()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $productoId = (int)($_POST['producto_id'] ?? 0);
        $servicioInput = trim($_POST['servicio_id'] ?? '');

        if (!$productoId || empty($servicioInput)) {
            $this->sendJson(['success' => false, 'message' => 'Datos de producto o servicio inválidos'], 422);
        }

        // Determinar si es servicio existente o nuevo
        if (is_numeric($servicioInput)) {
            $servicioId = (int)$servicioInput;
            $servicio = $this->db->get('servicios', '*', ['Servicio_ID' => $servicioId]);
            if (!$servicio) {
                $this->sendJson(['success' => false, 'message' => 'Servicio no encontrado'], 404);
            }
        } else {
            // Nuevo servicio
            $servicioNombre = $servicioInput;
            // Verificar si ya existe
            $servicioExistente = $this->db->get('servicios', '*', ['Nombre_Servicio' => $servicioNombre]);
            if ($servicioExistente) {
                $servicioId = $servicioExistente['Servicio_ID'];
            } else {
                $this->db->insert('servicios', ['Nombre_Servicio' => $servicioNombre, 'Activo' => 1]);
                $servicioId = $this->db->id();
            }
        }

        // Verificar si ya está asociado
        $asociacion = $this->db->get('servicios_productos', '*', [
            'Producto_ID' => $productoId,
            'Servicio_ID' => $servicioId
        ]);

        if ($asociacion) {
            if ($asociacion['Activo'] == 0) {
                $this->db->update('servicios_productos', ['Activo' => 1], ['Servicio_Producto_ID' => $asociacion['Servicio_Producto_ID']]);
                $this->sendJson(['success' => true, 'message' => 'Servicio reactivado correctamente']);
            } else {
                $this->sendJson(['success' => false, 'message' => 'El servicio ya está asociado al producto'], 422);
            }
        } else {
            $this->db->insert('servicios_productos', [
                'Producto_ID' => $productoId,
                'Servicio_ID' => $servicioId,
                'Activo' => 1
            ]);
            $this->sendJson(['success' => true, 'message' => 'Servicio agregado correctamente']);
        }
    }

    public function eliminarServicioProducto()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        $Id = (int)($_POST['id'] ?? 0);


        $asociacion = $this->db->get('servicios_productos', '*', [
            'ServProducto_ID' => $Id,
            'Activo' => 1
        ]);

        if (!$asociacion) {
            $this->sendJson(['success' => false, 'message' => 'servicio relacionado no encontrada'], 404);
        }

        $this->db->update('servicios_productos', ['Activo' => 0], ['ServProducto_ID' => $asociacion['ServProducto_ID']]);
        $this->sendJson(['success' => true, 'message' => 'Servicio eliminado del producto']);
    }
}
