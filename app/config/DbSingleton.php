<?php

namespace app\config;

use Medoo\Medoo;
use PDO;

class DbSingleton
{

    private static $instance;
    private $database;


    private function __construct()
    {
        date_default_timezone_set('America/Mexico_City');

        $ini = parse_ini_file(__DIR__ . '/config.ini', true);

        $config = $ini['BDCONF'];

        $this->database = new Medoo([
            'type' => 'mysql',
            'host' => $config['host'],
            'database' => $config['schema'],
            'username' => $config['username'],
            'password' => $config['password'],
            'charset'  => 'utf8mb4',
            'option'   => [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                        ]
        ]);
    }


    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new DbSingleton();
        }
        return self::$instance;
    }

    public function getDatabase()
    {
        return $this->database;
    }
}
