<?php

    namespace FlatOS\System;

    /**
     * FlatOS User Manager
     *
     * @author Axel Nana
     * @version 2.0.0
     * @copyright (c) 2016 Centers Technologies
     * @package FlatOS
     */

    /**
     * User
     *
     * @author     Axel Nana
     * @package    FlatOS
     * @subpackage System
     */
    class User extends Kernel {

        /**
         * The User Session variable.
         *
         * @var array
         * @access protected
         */
        protected $session;

        protected $user;

        public function __construct() {
            $this->session = &$_SESSION['flatos'];
        }

        public function getUsername() {
            return $this->session['username'];
        }

        public function getUserDir($dir = '') {
            return $this->getModule('FS')->toInternalPath('~/'.$dir);
        }

        public function listUserDir($dir = '') {
            $userDir  = $this->getUserDir($dir);
            $contents = $this->getModule('File')->open($userDir);

            if ($dir == '') {
                foreach ($contents as $name => $desc) {
                    $contents[$name]['icon'] = 'folder_'.strtolower($name);
                }
            }
            return $contents;
        }

        public function isSession() {
            return isset($this->session) && isset($this->session['username']) && strlen($this->session['username']) > 0;
        }

        public function set_session_value($id, $value) {
            $this->session[$id] = $value;
        }

        public function get_session_value($id) {
            return isset($this->session[$id]) ? $this->session[$id] : NULL;
        }

        public function getUserList() {
            return $this->getModule('FS')->readDir('users');
        }

        public function getTruePath($path, $user = NULL) {
            $fs = &$this->getModule('FS');
            if (isset($user)) {
                $fs->newAlias('~', 'users/'.$user);
            }

            return $fs->toFileSystemPath($path);
        }

    }

    /**
     * UserException
     */
    class UserException extends \RuntimeException { }
