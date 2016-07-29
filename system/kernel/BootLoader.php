<?php

    namespace FlatOS\System;

    /**
     * BootLoader
     *
     * Load FlatOS and initialize environment.
     *
     * @author      Axel Nana
     * @package     FlatOS
     * @subpackage  System
     */
    class BootLoader extends Kernel {

        /**
         * Store the current Kernel instance
         *
         * @var object
         * @access private
         **/
        private static $_class = array();

        /**
         * Class constructor
         */
        public function __construct() {
            // Initialize classes
            $this->_load_class('User');
            $this->_load_class('UserInterface');
        }

        /**
         * Used to boot FlatOS
         *
         * Initialize defaults, initialize or update session variables.
         */
        public function boot() {
            // Initialize sessions
            $user = self::$_class['user'];
            $is_session = $user->isSession();

            /**
             * Used for testing...
             * Remove IT for deployement
             */
            if ($is_session) {
                $user->set_session_value('username', NULL);
            }

            // Initialize interface
            $ui = self::$_class['userinterface'];
            $ui->render();
        }

        /**
         * Load and store a FlatOS's Kernel Class
         *
         * @param string $name  The name of the class to load
         * @param string $alias The key (optional)
         *
         * @return object
         *
         * @access private
         **/
        private function &_load_class($name, $alias = NULL) {
            // strtolower-ing the name to create an alias key
            $key = isset($alias) ? $alias : strtolower($name);

            if (! isset(self::$_class[$key])) {
                self::$_class[$key] = $this->getModule($name);
            }

            return self::$_class[$key];
        }

    }
