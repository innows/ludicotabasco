<?php

/**
 * Controlador de datos para el inicio y el catálogo público.
 */

namespace Admin\Controllers;

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

        return [
            'title' => 'Inicio',
            'productos' => $productos,
            'categorias' => $categorias,
            'banners' => $banners,
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
