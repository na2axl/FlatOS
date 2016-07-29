<?php

    namespace FlatOS\System;

    require_once ( dirname(dirname(dirname(__FILE__))) . '/boot/init.php' );

    /**
     * Getting API parameters
     */
    $api           = null;
    $api_class     = isset($_POST['api_class'])     ? $_POST['api_class']     : null;
    $api_method    = isset($_POST['api_method'])    ? $_POST['api_method']    : null;
    $api_arguments = isset($_POST['api_arguments']) ? $_POST['api_arguments'] : array();

    if (isset($api_class)) {
        $api = new \FlatOS\Api\Call($api_class, $api_method);
    }

    if (isset($api) && is_object($api)) {
        try {
            $json = json_encode( array( 'err' => false, 'err_msg' => '', 'res' => $api->call($api_arguments) ) );
        }
        catch (ApiExceptionException $e) {
            $json = json_encode( array( 'err' => true, 'err_msg' => $e->getMessage(), 'res' => '' ) );
        }
    }
    else {
        $json = json_encode( array( 'err' => true, 'err_msg' => "An unexpected error occured while calling the API. Maybe the API \"{$api_class}\" doesn't exists.", 'res' => '' ) );
    }

    echo $json;