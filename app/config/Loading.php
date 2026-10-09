<?php

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_ACEPTED = 202;
const HTTP_NOT_FOUND = 404;
const HTTP_BAD_REQUEST = 400;
const HTTP_IM_A_TEAPOT = 418;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_IMPLEMENTED = 501;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_INTERNAL_SERVER_ERROR = 500;

class Loading
{
    public static function classLoader(string $classname)
    {
        $vendorDir = dirname(__DIR__);
        $baseDir = dirname($vendorDir);

        $filepath = $baseDir . DIRECTORY_SEPARATOR . $classname . '.php';

        if ($_SERVER['HTTP_HOST'] != 'localhost') {
            $filepath = str_replace('\\', DIRECTORY_SEPARATOR, $filepath);
        }

        if (is_readable($filepath)) {
            require_once $filepath;
        }
    }
}

spl_autoload_register('Loading::classLoader');
