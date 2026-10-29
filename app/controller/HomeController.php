<?php

/**
 * Controlador de datos para el inicio y el catálogo público.
 */

namespace Admin\Controllers;

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

class HomeController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function index(): array
    {
        $productos = $this->db->select('productos', '*', [
            'estado' => '1',
            'destacado' => 1,
            'LIMIT' => 6,
            'ORDER' => ['fecha_creacion' => 'DESC'],
        ]);

        $categorias = $this->db->select('categorias', '*', [
            'estado' => '1',
            'ORDER' => ['orden' => 'ASC'],
        ]);

        $banners = $this->db->select('tbl_banner', '*', [
            'Activo' => 1,
            'ORDER' => ['Banner_ID' => 'ASC'],
        ]);

        $logos = $this->db->select('tbl_logosBussines', '*', [
        'ORDER' => ['Cliente_ID' => 'DESC']
    ]);

        return [
            'title' => 'Inicio',
            'productos' => $productos,
            'categorias' => $categorias,
            'banners' => $banners,
            'logos' => $logos
        ];
    }

    /** Datos compartidos por todas las vistas públicas. */
    public function ContactoPage(): array
    {
        return [
            'config' => $this->db->get('configuracion', '*', ['id' => 1]),
        ];
    }

    /**
     * Recibe la cotizacion creada en el navegador y la entrega al area comercial.
     * Este endpoint siempre responde JSON porque es consumido por AJAX.
     */
    public function enviar(): never
    {
        $input = $this->requestData();
        $items = $this->validateItems($input['items'] ?? null);

        $name = $this->textValue($input['name'] ?? '', 120);
        $company = $this->textValue($input['empresa'] ?? '', 150);
        $phone = $this->textValue($input['phone'] ?? '', 40);
        $email = trim((string) ($input['email'] ?? ''));
        $state = $this->textValue($input['estado'] ?? '', 100);
        $message = $this->textValue($input['message'] ?? '', 2000);

        if (count($items) === 0) {
            $this->jsonResponse(['success' => false, 'message' => 'La cotizacion debe incluir al menos un producto.'], 422);
        }

        if (mb_strlen($name) < 2) {
            $this->jsonResponse(['success' => false, 'message' => 'Ingresa tu nombre completo.'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['success' => false, 'message' => 'Ingresa un correo electronico valido.'], 422);
        }

        try {
            $mail = $this->createMailer();
            $mail->addAddress('cotizaciones@ludicodemexico.com.mx', 'Cotizaciones Ludico de Mexico');
            $mail->addReplyTo($email, $name);
            $mail->Subject = 'Nueva solicitud de cotizacion - ' . $name;
            $mail->isHTML(true);
            $mail->Body = $this->quoteHtml($items, $name, $company, $phone, $email, $state, $message);
            $mail->AltBody = $this->quoteText($items, $name, $company, $phone, $email, $state, $message);
            $mail->send();
        } catch (MailException $exception) {
            error_log('No se pudo enviar la cotizacion: ' . $exception->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'No fue posible enviar la cotizacion. Intenta nuevamente mas tarde.'], 502);
        } catch (\Throwable $exception) {
            error_log('Error al preparar la cotizacion: ' . $exception->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'No fue posible procesar la cotizacion.'], 500);
        }

        $this->jsonResponse(['success' => true, 'message' => 'Tu cotizacion fue enviada correctamente.']);
    }

    /** Recibe el formulario general de contacto, sin productos asociados. */
    public function enviarContacto(): never
    {
        $input = $this->requestData();
        $name = $this->textValue($input['name'] ?? '', 120);
        $company = $this->textValue($input['empresa'] ?? '', 150);
        $phone = $this->textValue($input['phone'] ?? '', 40);
        $email = trim((string) ($input['email'] ?? ''));
        $state = $this->textValue($input['estado'] ?? $input['idEstado'] ?? '', 100);
        $message = $this->textValue($input['message'] ?? '', 2000);

        if (mb_strlen($name) < 2) {
            $this->jsonResponse(['success' => false, 'message' => 'Ingresa tu nombre completo.'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['success' => false, 'message' => 'Ingresa un correo electronico valido.'], 422);
        }

        if (mb_strlen($message) < 5) {
            $this->jsonResponse(['success' => false, 'message' => 'Escribe un mensaje de al menos 5 caracteres.'], 422);
        }

        try {
            $mail = $this->createMailer();
            $mail->addAddress('cotizaciones@ludicodemexico.com.mx', 'Ludico de Mexico');
            $mail->addReplyTo($email, $name);
            $mail->Subject = 'Nuevo mensaje de contacto';
            $mail->isHTML(true);
            $mail->Body = $this->contactHtml($name, $company, $phone, $email, $state, $message);
            $mail->AltBody = $this->contactText($name, $company, $phone, $email, $state, $message);
            $mail->send();
        } catch (MailException $exception) {
            error_log('No se pudo enviar el mensaje de contacto: ' . $exception->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'No fue posible enviar tu mensaje. Intenta nuevamente mas tarde.'], 502);
        } catch (\Throwable $exception) {
           
            error_log('Error al preparar el mensaje de contacto: ' . $exception->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'No fue posible procesar tu mensaje.'], 500);
        }

        $this->jsonResponse(['success' => true, 'message' => 'Tu mensaje fue enviado correctamente.']);
    }

    private function requestData(): array
    {
        if (str_contains((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
            $data = json_decode((string) file_get_contents('php://input'), true);
            return is_array($data) ? $data : [];
        }

        return $_POST;
    }

    private function validateItems(mixed $rawItems): array
    {
        if (!is_array($rawItems) || count($rawItems) === 0 || count($rawItems) > 50) {
            return [];
        }

        $items = [];
        foreach ($rawItems as $rawItem) {
            if (!is_array($rawItem)) {
                return [];
            }

            $name = $this->textValue($rawItem['name'] ?? '', 180);
            $quantity = filter_var($rawItem['quantity'] ?? null, FILTER_VALIDATE_INT, [
                'options' => ['min_range' => 1, 'max_range' => 999],
            ]);

            if ($name === '' || $quantity === false) {
                return [];
            }

            $items[] = [
                'name' => $name,
                'quantity' => $quantity,
            ];
        }

        return $items;
    }

    private function createMailer(): PHPMailer
    {
        $host = 'smtp.hostinger.com';
        $username = 'cotizaciones@ludicodemexico.com.mx';
        $password = 'C0t1Zaciones*';
        $from =  $username;

        if ($host === '' || $username === '' || $password === '' || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException('La configuracion SMTP no esta completa.');
        }

        $port = filter_var(getenv('SMTP_PORT') ?: 587, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 65535],
        ]);
        $encryption = strtolower((string) (getenv('SMTP_ENCRYPTION') ?: 'tls'));

        $mail = new PHPMailer(true);
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = $port ?: 465;
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = $password;
        $mail->Timeout = 20;
        $mail->SMTPDebug = 0;
        $mail->setFrom($from, (string) (getenv('SMTP_FROM_NAME') ?: 'Ludico de Mexico'));

        if ($encryption === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } elseif ($encryption === 'none') {
            $mail->SMTPSecure = '';
            $mail->SMTPAutoTLS = false;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        return $mail;
    }

    private function quoteHtml(array $items, string $name, string $company, string $phone, string $email, string $state, string $message): string
    {
        $rows = '';
        foreach ($items as $item) {
            $rows .= '<tr><td style="padding:8px;border:1px solid #ddd;">' . $this->escapeHtml($item['name'])
                . '</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">' . $item['quantity'] . '</td></tr>';
        }

        return '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#222;">'
            . '<h2>Nueva solicitud de cotizacion</h2>'
            . '<p><strong>Nombre:</strong> ' . $this->escapeHtml($name) . '<br>'
            . '<strong>Empresa:</strong> ' . $this->escapeHtml($company ?: 'No especificada') . '<br>'
            . '<strong>Telefono:</strong> ' . $this->escapeHtml($phone ?: 'No especificado') . '<br>'
            . '<strong>Correo:</strong> ' . $this->escapeHtml($email) . '<br>'
            . '<strong>Estado:</strong> ' . $this->escapeHtml($state ?: 'No especificado') . '</p>'
            . '<p><strong>Mensaje:</strong><br>' . nl2br($this->escapeHtml($message ?: 'Sin comentarios.')) . '</p>'
            . '<table style="border-collapse:collapse;width:100%;max-width:700px;"><thead><tr>'
            . '<th style="padding:8px;border:1px solid #ddd;text-align:left;">Producto</th>'
            . '<th style="padding:8px;border:1px solid #ddd;">Cantidad</th>'
            . '</tr></thead><tbody>' . $rows . '</tbody></table></body></html>';
    }

    private function quoteText(array $items, string $name, string $company, string $phone, string $email, string $state, string $message): string
    {
        $lines = [
            'Nueva solicitud de cotizacion',
            'Nombre: ' . $name,
            'Empresa: ' . ($company ?: 'No especificada'),
            'Telefono: ' . ($phone ?: 'No especificado'),
            'Correo: ' . $email,
            'Estado: ' . ($state ?: 'No especificado'),
            'Mensaje: ' . ($message ?: 'Sin comentarios.'),
            '',
            'Productos:',
        ];

        foreach ($items as $item) {
            $lines[] = '- ' . $item['name'] . ' (Cantidad: ' . $item['quantity'] . ')';
        }

        return implode("\n", $lines);
    }

    private function contactHtml(string $name, string $company, string $phone, string $email, string $state, string $message): string
    {
        return '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#222;">'
            . '<h2>Nuevo mensaje de contacto</h2>'
            . '<p><strong>Nombre:</strong> ' . $this->escapeHtml($name) . '<br>'
            . '<strong>Empresa:</strong> ' . $this->escapeHtml($company ?: 'No especificada') . '<br>'
            . '<strong>Telefono:</strong> ' . $this->escapeHtml($phone ?: 'No especificado') . '<br>'
            . '<strong>Correo:</strong> ' . $this->escapeHtml($email) . '<br>'
            . '<strong>Estado:</strong> ' . $this->escapeHtml($state ?: 'No especificado') . '</p>'
            . '<p><strong>Mensaje:</strong><br>' . nl2br($this->escapeHtml($message)) . '</p>'
            . '</body></html>';
    }

    private function contactText(string $name, string $company, string $phone, string $email, string $state, string $message): string
    {
        return implode("\n", [
            'Nuevo mensaje de contacto',
            'Nombre: ' . $name,
            'Empresa: ' . ($company ?: 'No especificada'),
            'Telefono: ' . ($phone ?: 'No especificado'),
            'Correo: ' . $email,
            'Estado: ' . ($state ?: 'No especificado'),
            'Mensaje: ' . $message,
        ]);
    }

    private function textValue(mixed $value, int $maxLength): string
    {
        $value = trim(is_scalar($value) ? (string) $value : '');
        return mb_substr($value, 0, $maxLength);
    }

    private function escapeHtml(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private function jsonResponse(array $payload, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Resuelve un slug público de categoría o subcategoría.
     * Devuelve null cuando el slug no pertenece al catálogo.
     */
    public function catalogoPorSlugJerarquico(string $slugCategoria, ?string $slugSubcategoria = null): ?array
    {
        // 1. Validar y obtener la Categoría principal por su slug
        $categoria = $this->db->get('categorias', '*', [
            'slug' => $slugCategoria,
            'estado' => '1',
        ]);

        if (!$categoria) {
            return null; // 404: La categoría no existe o está inactiva
        }

        // 2. CASO DOS SEGMENTOS: URL tipo /categoria/subcategoria
        if ($slugSubcategoria !== null) {
            // Buscamos la subcategoría por su slug
            $subcategoria = $this->db->get('subcategorias', '*', [
                'slug_subcategoria' => $slugSubcategoria,
                'estado' => '1',
            ]);

            if (!$subcategoria) {
                return null; // 404: Subcategoría no encontrada
            }

            // La relación entre categoría y subcategoría está en productos. La URL
            // sólo es válida cuando esa subcategoría pertenece a esta categoría.
            $productos = $this->db->select('productos', '*', [
                'categoria_id'    => $categoria['id'],
                'subcategoria_id' => $subcategoria['Subcategoria_ID'],
                'estado'          => '1',
                'ORDER'           => ['nombre' => 'ASC'],
            ]);

            if (empty($productos)) {
                return null;
            }

            return [
                'tipo_catalogo'       => 'subcategoria',
                'categoria'           => $categoria,
                'subcategoria'        => $subcategoria,
                'categoria_padre'     => ['nombre' => $categoria['nombre'], 'slug' => $categoria['slug']],
                'productos'           => $productos,
                'subcategorias'       => [], // Vacío porque ya estamos dentro de la subcategoría
                'titulo_seccion'      => $subcategoria['Subcategoria'],
                'descripcion_seccion' => '',
            ];
        }

        // 3. CASO UN SEGMENTO: URL tipo /categoria
        // Verificamos si esta categoría posee subcategorías activas con productos asociados
        $subcategoriasRaw = $this->db->query(
            "SELECT DISTINCT
            s.*,
            p.categoria_id
        FROM
            subcategorias s
            INNER JOIN productos p ON p.subcategoria_id = s.Subcategoria_ID
        WHERE
            p.categoria_id = :cat_id
            AND s.estado = '1'
            AND p.estado = '1'
        ORDER BY s.Subcategoria ASC",
            [':cat_id' => $categoria['id']]
        )->fetchAll(\PDO::FETCH_ASSOC);

        // Si tiene subcategorías, el catálogo debe mostrar las subcategorías (en lugar de productos)
        if (!empty($subcategoriasRaw)) {
            // Estructuramos las subcategorías limpias
            $subcategoriasList = [];
            foreach ($subcategoriasRaw as $sub) {
                $subcategoriasList[] = [
                    'id'     => $sub['Subcategoria_ID'],
                    'nombre' => $sub['Subcategoria'],
                    'slug'   => $sub['slug_subcategoria'] ?? $sub['Subcategoria_ID'],
                    'imagen' => $sub['imagen'] ?? null,
                ];
            }

            return [
                'tipo_catalogo'       => 'lista_subcategorias',
                'categoria'           => $categoria,
                'subcategoria'        => null,
                'categoria_padre'     => null,
                'productos'           => [],
                'subcategorias'       => $subcategoriasList,
                'titulo_seccion'      => $categoria['nombre'],
                'descripcion_seccion' => $categoria['descripcion'] ?? '',
            ];
        }

        // Si la categoría NO tiene subcategorías, cargamos directamente sus productos
        $productos = $this->db->select('productos', '*', [
            'categoria_id' => $categoria['id'],
            'estado'       => '1',
            'ORDER'        => ['nombre' => 'ASC'],
        ]);

        return [
            'tipo_catalogo'       => 'categoria',
            'categoria'           => $categoria,
            'subcategoria'        => null,
            'categoria_padre'     => null,
            'productos'           => $productos,
            'subcategorias'       => [],
            'titulo_seccion'      => $categoria['nombre'],
            'descripcion_seccion' => $categoria['descripcion'] ?? '',
        ];
    }
}
