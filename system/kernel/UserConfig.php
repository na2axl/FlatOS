<?php

    namespace FlatOS\System;

    class UserConfig extends User {

        /**
         * The configuration file to use
         *
         * @var string
         */
        protected $configfile;

        private static $fs;

        public function __construct($user = NULL) {
            parent::__construct();
            self::$fs = &$this->getModule('FS');

            if (isset($user)) {
                $this->user = $user;
                self::$fs->newAlias('~', 'users/'.$user);
            }
            else {
                $this->user = $this->getUsername();
            }
        }

        /**
         * Get a configuration file from an user
         *
         * @param string  $configfile The configuration file name.
         * @param boolean $required   If the file is required or not.
         * @param string  $user       The specific user.
         *
         * @return array
         *
         * @throws UserException
         */
        public function getConfig($configFile = NULL, $required = FALSE, $user = NULL) {
            if (isset($user)) {
                $this->user = $user;
                self::$fs->newAlias('~', 'users/'.$user);
            }

            $filepath = isset($configFile) ? "~/.config/{$configFile}.json" : "~/.config/{$this->configfile}.json";

            if (self::$fs->exists($filepath)) {
                $config = self::$fs->read($filepath);
                return json_decode($config, TRUE);
            } else {
                if ($required) {
                    throw new UserException("The configuration file \"{$configFile}\" doesn't exists for the user \"{$this->user}\"", 1);
                } else {
                    return array();
                }
            }
        }

    }