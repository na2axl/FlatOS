<?php

    namespace FlatOS\System;

    /**
     * FlatOS Kernel
     *
     * @author Axel Nana
     * @version 1.0.0
     * @copyright (c) Centers Technologies, 2016
     * @package FlatOS
     * @subpackage System
     */

    /**
     * FlatOS
     *
     * The Kernel of the webos
     *
     * @package FlatOS
     * @subpackage System
     * @author Axel Nana
     */
    abstract class Kernel {

        /**
         * Instance of the the current
         * loaded module.
         *
         * @var object
         */
        private static $module;

        /**
         * Set the module to load
         * in the Kernel.
         *
         * @param string $module The name of the module to load.
         *
         * @return void
         * @author Axel Nana
         */
        protected function setModule($module) {
            $class = '\\FlatOS\\System\\'.$module;
            if (class_exists($module)) {
                self::$module = new $class();
            }
            else {
                $module_path = __DIR__ . '/' . $module . '.php';
                if (file_exists($module_path)) {
                    require_once $module_path;
                    self::$module = new $class();
                }
                else {
                    throw new KernelException('Fatal Error: Cannot load the module "'.$module.'". The module isn\'t found.');
                }
            }
        }

        /**
         * Get the current loaded module,
         * or set a new module to load and
         * get it immediately.
         *
         * @return object
         * @author Axel Nana
         */
        protected function &getModule($module = false) {
            if ($module !== false) {
                $this->setModule($module);
            }
            return self::$module;
        }

    }

    class KernelException extends \RuntimeException { }