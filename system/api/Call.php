<?php

    namespace FlatOS\Api;

    /**
     * ApiCall
     *
     * Bridge between a PHP class and a Javascript class.
     *
     * @author Axel Nana
     * @package FlatOS
     * @subpackage API
     */
    class Call {

        /**
         * The API folder path
         *
         * @var string
         * @access public
         */
        public $api_path = '../kernel';

        /**
         * The API class name
         *
         * @var string
         * @access private
         */
        private $class;

        /**
         * The API method to call
         *
         * @var string
         * @access protected
         */
        protected $method;

        /**
         * The API method's arguments
         *
         * @var array
         * @access protected
         */
        protected $arguments = array();

        /**
         * The current API instance
         *
         * @var object
         * @access protected
         * @static
         */
        protected static $instance;

        /**
         * Class Constructor
         *
         * @param string $class  The API class name.
         * @param string $method The API method to call.
         */
        public function __construct($class = null, $method = null, $arguments = null) {
            $this->setClass($class);
            $this->setMethod($method);
            $this->setArguments($method);
        }

        /**
         * Define the API class name to use.
         *
         * @param string $class The API class name.
         *
         * @return object The current instance, to make a chainable call.
         */
        public function setClass($class) {
            $this->class = $class;
            return $this;
        }

        /**
         * Define the API method to call.
         *
         * @param string $method The API method name.
         *
         * @return object The current instance, to make a chainable call.
         */
        public function setMethod($method) {
            $this->method = $method;
            return $this;
        }

        /**
         * Define the API method's arguments.
         *
         * @param array $arguments The array list of arguments.
         *
         * @return object The current instance, to make a chainable call.
         */
        public function setArguments($arguments) {
            $this->arguments = $arguments;
            return $this;
        }

        /**
         * Call the API.
         *
         * @return object The current instance, to make a chainable call.
         */
        public function call(array $arguments = array()) {
            if (empty($this->class) || strlen($this->class) == 0) {
                throw new ApiException("Cannot call an API without a class name.");
            }

            if (empty(self::$instance)) {
                $this->_instanciate();
            }

            $arguments = isset($arguments) ? $arguments : $this->arguments;

            return call_user_func_array(array(&self::$instance, $this->method), $arguments);
        }

        /**
         * Get the instance of the currently called API.
         *
         * @static
         * @return object The API's instance.
         */
        public static function &getInstance() {
            return self::$instance;
        }

        /**
         * Instanciate the API.
         *
         * @access protected
         */
        protected function _instanciate() {
            $filename = $this->api_path.'/'.$this->class.'.php';

            if (file_exists($filename)) {
                require_once $filename;
            }
            else {
                throw new ApiException("The API file \"{$filename}\" doesn't exists in the folder \"{$this->api_path}\".");
            }

            $this->class = '\\FlatOS\\System\\' . $this->class;

            self::$instance = new $this->class();
        }

    }

    /**
     * Api Exception.
     */
    class ApiException extends \RuntimeException { }