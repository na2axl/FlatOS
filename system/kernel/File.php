<?php

    namespace FlatOS\System;

    /**
     * File
     *
     * File manager for "File Selector" and "File Saver"
     * system applications.
     *
     * @author     Axel Nana
     * @package    FlatOS
     * @subpackage System
     */
    class File extends FS {

        /**
         * File selector
         *
         * The method that the "File Selector" system app use
         * to list and open files.
         *
         * @param string $path The path of the file to open
         *
         * @return array
         */
        public function open($path) {
            $files = array();
            $temp  = array();

            $fList  = $this->readDir($path);
            $parent = $this->dirname($path);

            if (!$this->isDir($path)) {
                $parent = $this->dirname($parent);
            }

            if ($parent !== false) {
                $fList = array_merge(array('..' => $parent), $fList);
            }

            foreach ($fList as $file => $filepath) {
                $temp[$file] = array(
                    'type' => $this->extension($filepath),
                    'size' => $this->sizeInOctets($filepath),
                    'path' => $filepath
                );
            }

            foreach ($temp as $name => $desc) {
                if ($name[0] == '.' && $name != '..' && $this->isDir($desc['path'])) {
                    continue;
                }
                else {
                    $files[$name] = $desc;
                }
            }

            return $files;
        }

        /**
         * File Saver
         *
         * The method that the "File Saver" system app
         * use to save files.
         *
         * @param string  $path   The file to write in
         * @param string  $data   The new contents of the file
         * @param boolean $append If the datas have to be appended in the file
         *
         * @uses FS::write()
         *
         * @return boolean
         */
        public function save($path, $data, $append = FALSE) {
            return $this->write($path, $data, $append);
        }
    }
