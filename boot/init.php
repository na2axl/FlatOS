<?php

    session_start();

    function autoload($class) {
        $classPath = str_replace('\\', '/', $class).'.php';
        $webosFile = realpath(dirname(__DIR__).'/'.$classPath);
        if (file_exists($webosFile)) {
            return require $webosFile;
        }
    }
    spl_autoload_register('autoload');

    // Loading FlatOS kernel...
    autoload('system/kernel/HTTPRequest');
    autoload('system/kernel/HTTPResponse');
    autoload('system/kernel/RawData');
    autoload('system/kernel/Kernel');
    autoload('system/kernel/BootLoader');
    autoload('system/kernel/JSONQL');
    autoload('system/kernel/FS');
    autoload('system/kernel/File');
    autoload('system/kernel/User');
    autoload('system/kernel/UserInterface');
    autoload('system/kernel/UserConfig');

    // Loading API...
    autoload('system/api/Call');