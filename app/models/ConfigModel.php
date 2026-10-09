<?php
/**
 * Modelo de Configuración
 * Sistema CMS + Catálogo Web
 */

namespace App\Models;

class ConfigModel {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function get() {
        return $this->db->get('configuracion', '*', ['id' => 1]);
    }
    
    public function update($data) {
        return $this->db->update('configuracion', $data, ['id' => 1]);
    }
}