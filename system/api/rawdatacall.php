<?php

    namespace FlatOS\System;

    require_once ( dirname(dirname(dirname(__FILE__))) . '/boot/init.php' );

    $raw = new RawData();
    $raw->render();