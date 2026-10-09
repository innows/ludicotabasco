<?php
/**
 * Modelo de Productos
 * Sistema CMS + Catálogo Web
 */

namespace App\Models;

class ProductoModel {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = null, $offset = null, $categoria = null) {
        $where = ['estado' => 'activo'];
        
        if ($categoria) {
            $where['categoria_id'] = $categoria;
        }
        
        $options = [
            'ORDER' => ['fecha_creacion' => 'DESC']
        ];
        
        if ($limit) {
            $options['LIMIT'] = $offset ? [$offset, $limit] : $limit;
        }
        
        return $this->db->select('productos', '*', [
            'AND' => $where,
            'LIMIT' => $options['LIMIT'] ?? 100,
            'ORDER' => $options['ORDER']
        ]);
    }
    
    public function getById($id) {
        return $this->db->get('productos', '*', ['id' => $id]);
    }
    
    public function getBySlug($slug) {
        return $this->db->get('productos', '*', ['slug' => $slug]);
    }
    
    public function getDestacados($limit = 6) {
        return $this->db->select('productos', '*', [
            'estado' => 'activo',
            'destacado' => 1,
            'LIMIT' => $limit,
            'ORDER' => ['fecha_creacion' => 'DESC']
        ]);
    }
    
    public function search($query, $limit = 20) {
        return $this->db->select('productos', '*', [
            'AND' => [
                'estado' => 'activo',
                'OR' => [
                    'nombre[~]' => $query,
                    'descripcion[~]' => $query
                ]
            ],
            'LIMIT' => $limit,
            'ORDER' => ['fecha_creacion' => 'DESC']
        ]);
    }
    
    public function create($data) {
        $data['slug'] = $this->generateSlug($data['nombre']);
        $data['fecha_creacion'] = date('Y-m-d H:i:s');
        return $this->db->insert('productos', $data);
    }
    
    public function update($id, $data) {
        $data['fecha_actualizacion'] = date('Y-m-d H:i:s');
        return $this->db->update('productos', $data, ['id' => $id]);
    }
    
    public function delete($id) {
        return $this->db->update('productos', ['estado' => 'eliminado'], ['id' => $id]);
    }
    
    public function count($categoria = null) {
        $where = ['estado' => 'activo'];
        if ($categoria) {
            $where['categoria_id'] = $categoria;
        }
        return $this->db->count('productos', $where);
    }
    
    private function generateSlug($text) {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
        $text = preg_replace('/[\s-]+/', '-', $text);
        return trim($text, '-');
    }
}