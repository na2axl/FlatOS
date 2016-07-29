<?php

    namespace FlatOS\System;

    /**
     * RawDataCall
     */
    class RawData {

        /**
         * Filepath
         *
         * @var string
         **/
        private $path;

        /**
         * FS Instance
         *
         * @var FS
         **/
        private $FS;

        /**
         * HTTPResponse Instance
         *
         * @var HTTPResponse
         **/
        private $httpResponse;

        /**
         * HTTPRequest Instance
         *
         * @var HTTPRequest
         **/
        private $httpRequest;

        public function __construct($path = NULL) {
            $this->FS           = new FS();
            $this->httpResponse = new HTTPResponse();
            $this->httpRequest  = new HTTPRequest();

            $this->path = (isset($path)) ? $path : (($this->httpRequest->getExists('path')) ? $this->httpRequest->getData('path') : NULL);
        }

        private function _getMimetype() {
            return $this->FS->mimetype($this->path);
        }

        public function render() {
            $mime     = $this->_getMimetype();
            $contents = $this->FS->read($this->path);

            $this->httpResponse->setCacheable();
            $this->httpResponse->addHeader("content-type: {$mime};charset=utf-8");
            $this->httpResponse->setContent($contents);
            $this->httpResponse->send();
        }
    }
