<?php
/**
 * Modelo de Portafolio
 * Sistema CMS + Catálogo Web
 */

namespace App\Models;

class PortafolioModel {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll() {
        return $this->db->select('portafolio', '*', [
            'ORDER' => ['Portafolio_ID' => 'DESC']
        ]);
    }
    
    public function getById($id) {
        return $this->db->get('portafolio', '*', ['Portafolio_ID' => $id]);
    }
    
    public function getActivos() {
        return $this->db->select('portafolio', '*', [
            'Activo' => 1,
            'ORDER' => ['Portafolio_ID' => 'DESC']
        ]);
    }
    
    public function create($data) {
        return $this->db->insert('portafolio', $data);
    }
    
    public function update($id, $data) {
        return $this->db->update('portafolio', $data, ['Portafolio_ID' => $id]);
    }
    
    public function delete($id) {
        return $this->db->delete('portafolio', ['Portafolio_ID' => $id]);
    }
}