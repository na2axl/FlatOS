<?php

    // Loading required files...
    require ( __DIR__ . '/boot/init.php' );

    // Initialize the OS...
    $boot = new \FlatOS\System\BootLoader();
    $boot->boot();