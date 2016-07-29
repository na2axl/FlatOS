<?php

    namespace FlatOS\System;

    /**
     * UserInterface
     *
     * Load and manage the user interface of the current user.
     *
     * @author      Axel Nana
     * @package     FlatOS
     * @subpackage  System
     */
    class UserInterface extends User {

        /**
         * Path to the JsonConfig Include files
         *
         * @const string
         */
        const INCLUDES_PATH = 'system/etc/boot/includes.json';

        public function __construct() {
            parent::__construct();
        }

        protected function _getIncludes() {
            $config = array();
            $config['js']['core'] = json_decode($this->getModule('FS')->read(self::INCLUDES_PATH), TRUE);
            $core_css = $this->getModule('FS')->readDir("system/ui/core/interface", TRUE, array('file_type' => 'css', 'path_type' => FS::FILESYSTEM_PATH));
            if ($this->isSession()) {
                $user_config = new UserConfig();
                $ui = $user_config->getConfig('ui', TRUE);
                foreach (array('interface', 'icons') as $value) {
                    $this->set_session_value($value, $ui[$value]);
                }
                $user_css = $this->getModule('FS')->readDir("system/ui/".$this->session['interface']."/interface", TRUE, array('file_type' => 'css', 'path_type' => FS::FILESYSTEM_PATH));
                $user_js = [];//$this->getModule('FS')->readDir("system/ui/".$this->session['interface']."/interface", TRUE, array('file_type' => 'js', 'path_type' => FS::FILESYSTEM_PATH));
            }
            else {
                $user_css = $this->getModule('FS')->readDir("system/ui/flatos/interface", TRUE, array('file_type' => 'css', 'path_type' => FS::FILESYSTEM_PATH));
                $user_js = $this->getModule('FS')->readDir("system/ui/flatos/interface", TRUE, array('file_type' => 'js', 'path_type' => FS::FILESYSTEM_PATH));
            }
            $config['css']['core'] = $core_css;
            $config['css']['user'] = $user_css;
            $config['js']['user']  = $user_js;

            return $config;
        }

        public function render() {
            $config = $this->_getIncludes();

            $cssIncludes = $config['css'];
            $jsIncludes  = $config['js'];

            ob_start();

            require ('boot/layout.php');

            echo ob_get_clean();
        }

    }