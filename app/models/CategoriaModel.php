<?php
/**
 * Modelo de Categorías
 * Sistema CMS + Catálogo Web
 */

namespace App\Models;

class CategoriaModel {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll() {
        return $this->db->select('categorias', '*', [
            'estado' => 'activo',
            'ORDER' => ['orden' => 'ASC']
        ]);
    }
    
    public function getById($id) {
        return $this->db->get('categorias', '*', ['id' => $id]);
    }
    
    public function getBySlug($slug) {
        return $this->db->get('categorias', '*', ['slug' => $slug]);
    }
    
    public function create($data) {
        $data['slug'] = $this->generateSlug($data['nombre']);
        $data['fecha_creacion'] = date('Y-m-d H:i:s');
        return $this->db->insert('categorias', $data);
    }
    
    public function update($id, $data) {
        $data['fecha_actualizacion'] = date('Y-m-d H:i:s');
        return $this->db->update('categorias', $data, ['id' => $id]);
    }
    
    public function delete($id) {
        return $this->db->update('categorias', ['estado' => 'eliminado'], ['id' => $id]);
    }
    
    private function generateSlug($text) {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
        $text = preg_replace('/[\s-]+/', '-', $text);
        return trim($text, '-');
    }
}