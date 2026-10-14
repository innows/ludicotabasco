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
    public function catalogoPorSlug(string $slug): ?array
    {
        $categoria = $this->db->get('categorias', '*', [
            'slug' => $slug,
            'estado' => '1',
        ]);

        if ($categoria) {
            return [
                'productos' => $this->db->select('productos', '*', [
                    'categoria_id' => $categoria['id'],
                    'estado' => '1',
                    'ORDER' => ['nombre' => 'ASC'],
                ]),
                'titulo_seccion' => $categoria['nombre'],
                'descripcion_seccion' => $categoria['descripcion'] ?? '',
                'tipo_catalogo' => 'categoria',
                'categoria_padre' => null,
            ];
        }

        $subcategoria = $this->db->get('subcategorias', '*', [
            'slug_subcategoria' => $slug,
            'estado' => '1',
        ]);

        if (!$subcategoria) {
            return null;
        }

        $categoriaPadre = $this->db->get('categorias', ['nombre', 'slug'], [
            'id' => $subcategoria['categoria_id'],
            'estado' => '1',
        ]) ?: null;

        return [
            'productos' => $this->db->select('productos', '*', [
                'subcategoria_id' => $subcategoria['Subcategoria_ID'],
                'estado' => '1',
                'ORDER' => ['nombre' => 'ASC'],
            ]),
            'titulo_seccion' => $subcategoria['Subcategoria'],
            'descripcion_seccion' => '',
            'tipo_catalogo' => 'subcategoria',
            'categoria_padre' => $categoriaPadre,
        ];
    }
}
