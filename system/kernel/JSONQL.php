<?php

    namespace FlatOS\System;

    /**
     * JSONQL.php
     *
     * @author Axel Nana <ax.lnana@outlook.com>
     * @version 1.1.3
     * @copyright (c) 2015 - 2016 Centers Technologies
     * @package FlatOS
     */

    /**
     * JSONQL
     *
     * A SQL query interpretor to store and
     * manage databases in JSON files.
     *
     * @author Axel Nana <ax.lnana@outlook.com>
     * @package FlatOS
     * @subpackage System
     */
    class JSONQL extends Kernel {

        /**
         * SQL characters to escape
         *
         * @const string
         */
        const ESCAPE_STRING = '\'"` ';

        /**
         * Parse value method for
         * prepared queries.
         *
         * @const integer
         */
        const PARAM_STRING = 0;
        const PARAM_INT = 1;
        const PARAM_BOOL = 2;

        /**
         * The path to the database
         *
         * A database is represented by
         * a folder which contains JSON files (tables).
         *
         * @var string
         * @access protected
         */
        protected $database;

        /**
         * The main query
         * SELECT|INSERT|DELETE|UPDATE|REPLACE|TRUNCATE
         *
         * @var string
         * @access protected
         */
        protected $main_query;

        /**
         * Main query options
         *
         * @var array
         * @access protected
         */
        protected $query_options = array();

        /**
         * Registered SQL operators
         *
         * @var array
         *
         * @access private
         */
        private $operators = array('<', '<=', '=', '<>', '>=', '>');

        /**
         * The query is prepared ?
         *
         * @var bool
         *
         * @access private
         */
        private $queryIsPrepared = FALSE;

        /**
         * The prepared query is executed ?
         *
         * @var bool
         *
         * @access private
         */
        private $queryIsExecuted = FALSE;

        /**
         * The prepared query.
         *
         * @var string
         *
         * @access private
         */
        private $preparedQueryString;

        /**
         * An array of keys binded in the
         * query.
         *
         * @var array
         *
         * @access private
         */
        private $preparedQueryKeys = array();

        /**
         * Store the result of a query.
         *
         * @var array
         */
        private $queryResults = array();

        /**
         * Current class instance.
         * Used for prepared queries.
         *
         * @var object
         *
         * @access private
         */
        private static $instance;

        /**
         * Class Constructor
         */
        public function __construct($database = '.') {
            $this->setDatabase($database);
            self::$instance = &$this ;
        }

        /**
         * Change the current database
         *
         * @param  string  $database_name  The path to the new JSONDB.
         *
         * @return void
         */
        public function setDatabase($database_name) {
            $this->database = $database_name;
        }

        /**
         * Create a new JSON DataBase.
         *
         * Create a new folder which represent the
         * DataBase. In this folder, all JSON files
         * will represent tables.
         *
         * @param string $database_name The path of the folder.
         * @param bool   $recursive     If we have to create all parent's directories if they not exist.
         *
         * @return bool
         *
         * @throws JSONQLException
         */
        public function create_database($database_name, $recursive = FALSE) {
            if (file_exists($database_name)) {
                throw new JSONQLException('JSONQL Error: Cannot create the database "'.$database_name.'", this folder already exists.');
            }
            else {
                if (mkdir($database_name, 0777, $recursive) === FALSE) {
                    throw new JSONQLException("JSONQL Error: Cannot create the database \"{$database_name}\". Maybe parent's directories doesn't exist.");
                }
                else {
                    chmod($database_name, 0777);
                    $this->setDatabase($database_name);
                    return TRUE;
                }
            }
        }

        /**
         * Create a new table.
         *
         * The table will be a JSON file stored
         * in a folder which represent the DataBase.
         *
         * @return bool
         *
         * @throws JSONQLException
         */
        public function create_table($table_name, array $prototype) {
            $table_path = $this->database.'/'.$table_name.'.json';
            if (file_exists($table_path)) {
                throw new JSONQLException('JSONQL Error: Cannot create the table "'.$table_name.'". The table file already exists.');
            }
            else {
                if (!in_array('id', $prototype)) {
                    array_unshift($prototype, 'id');
                }
                $data = array(
                    'prototype'  => $prototype,
                    'properties' => array('last_insert_id' => 0),
                    'datas'      => array()
                );
                if (touch($table_path) === FALSE) {
                    throw new JSONQLException("JSONQL Error: Cannot create file \"{$table_path}\"");
                }
                else {
                    chmod($table_path, 0777);
                    file_put_contents($table_path, json_encode($data));
                    return TRUE;
                }
            }

        }

        /**
         * Delete a JSON DataBase
         *
         * @param string $database_name The path to the JSONDB folder.
         *
         * @return bool
         *
         * @throws JSONQLException
         */
        public function delete_database($database_name) {
            if (!file_exists($database_name)) {
                throw new JSONQLException('JSONQL Error: Cannot delete the database "'.$database_name.'". This folder doesn\'t exists.');
            }
            else {
                $this->setDatabase($database_name);
                if ($handle = opendir($database_name)) {
                    while (($file = readdir($handle)) !== FALSE) {
                        if ($file == '.' || $file == '..') {
                            continue;
                        }
                        $this->delete_table(str_replace('.json', '', $file));
                    }
                    closedir($handle);
                }
                if (rmdir($database_name) === FALSE) {
                    throw new JSONQLException('JSONQL Error: Cannot delete the database "'.$database_name.'". An error occured');
                }
                else {
                    return TRUE;
                }
            }
        }

        /**
         * Delete a JSONDB table (JSON file).
         *
         * @param string $table_name The name of the table to delete (without the .json extension).
         *
         * @return bool
         *
         * @throws JSONQLException
         */
        public function delete_table($table_name) {
            $table_path = $this->database.'/'.$table_name.'.json';
            if (!file_exists($table_path)) {
                throw new JSONQLException('JSONQL Error: Cannot delete the table "'.$table_name.'". The JSON file "'.$table_path.'" doesn\'t exists.');
            }
            else {
                if (unlink($table_path) === FALSE) {
                    throw new JSONQLException('JSONQL Error: Cannot delete the table "'.$table_name.'". An error occured.');
                }
                else {
                    return TRUE;
                }
            }
        }

        /**
         * Send a query to the JSON DataBase.
         *
         * The query have to be in the SQL format.
         *
         * @param string $query The query.
         *
         * @return mixed
         *
         * @throws JSONQLException
         */
        public function query($query) {
            $query_part = explode(' ', trim($query));
            switch (strtolower($query_part[0])) {
                case 'select':
                    $this->_parseSelectQuery($query);
                    $this->execute();
                    return $this->getInstance();
                break;

                case 'insert':
                    $this->_parseInsertQuery($query);
                    return $this->execute();
                break;

                case 'delete':
                    $this->_parseDeleteQuery($query);
                    return $this->execute();
                break;

                case 'update':
                    $this->_parseUpdateQuery($query);
                    return $this->execute();
                break;

                case 'replace':
                    $this->_parseReplaceQuery($query);
                    return $this->execute();
                break;

                case 'truncate':
                    $this->_parseTruncateQuery($query);
                    return $this->execute();
                break;

                default:
                    throw new JSONQLException('JSONQL Error: Sorry but the SQL query "'.strtoupper($query_part[0]).'" does\'nt exists or not supported in JSONQL at the moment.');
                break;
            }
        }

        /**
         * Prepare a query for execution
         *
         * @return object
         *
         * @throws JSONQLException
         */
        public function prepare($query) {
            $this->preparedQueryString = $query;
            return $this->_prepareQuery();
        }

        /**
         * Bind a new value in the prepared query.
         *
         * @return void
         *
         * @throws JSONQLException
         */
        public function bindValue($key, $value, $parse_method = self::PARAM_STRING) {
            if ($this->_queryIsPrepared()) {
                if (in_array($key, $this->preparedQueryKeys)) {
                    switch ($parse_method) {
                        default:
                        case self::PARAM_STRING:
                            $array = (array) strval($value);
                            array_unshift($array, "'");
                            array_push($array, "'");
                            $value = strval($array[0].$array[1].$array[2]);
                        break;

                        case self::PARAM_INT:
                            $value = intval($value);
                        break;

                        case self::PARAM_BOOL:
                            $value = intval($value).":JSONQL::TO_BOOL:";
                        break;

                    }
                    $this->preparedQueryString = str_replace($key, $value, $this->preparedQueryString);
                }
                else {
                    throw new JSONQLException('JSONQL Error: Cannot bind the value "'.$value.'" for the key "'.$key.'". The key isn\'t in the query.');
                }
            }
            else {
                throw new JSONQLException('JSONQL Error: Cannot use JSONQL::bindValue() with non prepared queries. Send your query with JSONQL::prepare() first.');
            }
        }

        /**
         * Execute a query.
         *
         * This method execute a query only if $database,
         * $main_query and $query_options properties are set.
         *
         * @return bool
         *
         * @throws JSONQLException
         */
        public function execute() {
            $this->queryIsExecuted = TRUE;

            if ($this->_queryIsPrepared()) {
                $this->queryIsPrepared = FALSE;
                return $this->query($this->preparedQueryString);
            }

            if (!isset($this->database) || !isset($this->main_query) || count($this->query_options) == 0) {
                throw new JSONQLException('JSONQL ERROR: Cannot execute the query. No database/table selected or internal error.');
            }

            extract($this->query_options);
            $table_path = $this->database.'/'.$table.'.json';
            if (!file_exists($table_path) || !is_readable($table_path) || !is_writable($table_path)) {
                throw new JSONQLException('JSONQL Error: Cannot execute the query. The table "'.$table.'.json" doesn\'t exists or file access denied.');
            }
            else {
                $json_file  = file_get_contents($table_path);
                $json_array = json_decode($json_file, TRUE);
                switch ($this->main_query) {
                    case 'select':
                            $this->queryResults = $this->_select($json_array, $rows, $filters, $order_by, $order_method, $limit_from, $limit_to);
                    break;

                    case 'insert':
                            $inserted_val = $this->_insert($json_array, $rows, $values);
                            return boolval(file_put_contents($table_path, json_encode($inserted_val)));
                    break;

                    case 'delete':
                            $deleted_val = $this->_delete($json_array, $filters);
                            return boolval(file_put_contents($table_path, json_encode($deleted_val)));
                    break;

                    case 'update':
                            $updated_val = $this->_update($json_array, $values, $filters);
                            return boolval(file_put_contents($table_path, json_encode($updated_val)));
                    break;

                    case 'replace':
                            $replaced_val = $this->_replace($json_array, $rows, $values);
                            return boolval(file_put_contents($table_path, json_encode($replaced_val)));
                    break;

                    default:
                        throw new JSONQLException('JSONQL Error: Cannont execute the query. No query has been sent.');
                    break;
                }
            }
        }

        /**
         * Fetch datas after a query.
         *
         * @return array
         */
        public function fetch() {
            if ($this->_queryIsExecuted()) {
                return $this->queryResults;
            }
            else {
                throw new JSONQLException('JSONQL Error: Cannot fetch results without execute the prepared query.');
            }
        }

        /**
         * Prepare a query.
         *
         * @return object
         *
         * @access private
         */
        private function _prepareQuery() {
            $this->queryIsPrepared = TRUE;
            $query = $this->preparedQueryString;
            preg_match_all('#(:[a-zA-Z0-9_]+)#', $query, $keys);
            $this->preparedQueryKeys = $keys[0];
            return $this->getInstance();
        }

        /**
         * Gets the current instance
         *
         * @return object
         *
         * @access protected
         */
        protected static function &getInstance() {
            return self::$instance;
        }

        /**
         * Perform a SELECT query
         *
         * @param array $data    The array of data to select in.
         * @param array $rows    The rows to select in $data.
         * @param array $filters The filters for select datas specificly.
         *
         * @return array
         *
         * @access protected
         */
        protected function _select($data, $rows, $filters = array(), $order_by = 'id', $order_method = 'asc', $limit_from = FALSE, $limit_to = FALSE) {
            $result = $data['datas'];
            $temp = array();

            // If we have to order results, order it
            usort($result, function($after, $now) use ($order_method, $order_by) {
                if ($order_method == 'desc') {
                    return $now[$order_by] > $after[$order_by];
                }
                else {
                    return $now[$order_by] < $after[$order_by];
                }
            });

            // If select filters specified, applying them
            if (count($filters) > 0) {
                $result = $this->_filter($data, $filters);
            }

            // If is the last inserted id we want, get it
            if (in_array('last_insert_id', $rows)) {
                $temp['last_insert_id'] = $data['properties']['last_insert_id'];
                $result = $temp;
            }
            // Else if row to select are specified, get only them
            elseif (!in_array('*', $rows)) {
                foreach ($result as $line) {
                    $temp[] = array_intersect_key($line, $rows);
                }
                $result = $temp;
            }

            if ($limit_from !== FALSE) {
                if ($limit_to !== FALSE) {
                    $result = array_slice($result, $limit_from, $limit_to);
                }
                else {
                    $result = array_slice($result, $limit_from);
                }
            }

            return $result;
        }

        /**
         * Perform an INSERT query
         *
         * @param array  $data    The array of data to select in.
         * @param array  $rows    The rows to select in $data.
         * @param array  $values  The values to insert.
         *
         * @return array
         *
         * @access protected
         */
        protected function _insert($data, $rows, $values) {
            $result = FALSE;

            if (count($rows) == 0) {
                $rows = array_slice($data['prototype'], 1);
            }

            $current_data = $data['datas'];
            $id = intval($data['properties']['last_insert_id']) + 1;
            $index = 0;
            $insert = array();
            foreach ($values as $group_value) {
                $insert[$index]['id'] = $id;
                foreach ($group_value as $key => $value) {
                    $insert[$index][$rows[$key]] = $value;
                }
                $index++;
                $id++;
            }

            $insert = array_merge($current_data, $insert);

            foreach ($insert as $key => $line) {
                uksort($line, function($after, $now) use ($data) {
                    return array_search($now, $data['prototype']) < array_search($after, $data['prototype']);
                });
                $insert[$key] = $line;
            }

            usort($insert, function($after, $now) {
                return $now['id'] < $after['id'];
            });

            $data['datas'] = $insert;
            $data['properties']['last_insert_id'] = $id-1;

            return $data;
        }

        /**
         * Perform a REPLACE query
         *
         * @param array  $data    The array of data to select in.
         * @param array  $rows    The rows to select in $data.
         * @param array  $values  The values to insert.
         *
         * @return array
         *
         * @access protected
         */
        protected function _replace($data, $rows, $values) {
            if (count($rows) == 0) {
                $rows = array_slice($data['prototype']);
            }

            $current_data = $data['datas'];
            $index = 0;
            $insert = array();
            foreach ($values as $group_value) {
                foreach ($group_value as $key => $value) {
                    if ($rows[$key] == 'id') {
                        $value = intval($value);
                    }
                    $insert[$index][$rows[$key]] = $value;
                }
                $index++;
            }

            $insert = array_replace($current_data, $insert);

            foreach ($insert as $key => $line) {
                uksort($line, function($after, $now) use ($data) {
                    return array_search($now, $data['prototype']) < array_search($after, $data['prototype']);
                });
                $insert[$key] = $line;
            }

            usort($insert, function($after, $now) {
                return $now['id'] < $after['id'];
            });

            $data['datas'] = $insert;

            return $data;
        }

        /**
         * Perform a DELETE query
         *
         * @param array  $data    The data to delete in.
         * @param array  $filters The filters to apply.
         *
         * @return array
         *
         * @access protected
         */
        protected function _delete($data, $filters = array()) {
            $current_data = $data['datas'];
            $to_delete = $current_data;

            if (count($filters) > 0) {
                $to_delete = $this->_filter($data, $filters);
            }

            $insert = array();
            foreach ($to_delete as $line) {
                    if (in_array($line, $current_data)) {
                        $current_data[array_search($line, $current_data)] = null;
                    }
                }

            foreach ($current_data as $line) {
                    if (!empty($line)) {
                        $insert[] = $line;
                    }
                }

            foreach ($insert as $key => $line) {
                uksort($line, function($after, $now) use ($data) {
                    return array_search($now, $data['prototype']) < array_search($after, $data['prototype']);
                });
                $insert[$key] = $line;
            }

            usort($insert, function($after, $now) {
                return $now['id'] < $after['id'];
            });

            $data['datas'] = $insert;

            return $data;
        }

        /**
         * Perform an UPDATE query
         *
         * @param array  $data    The array of datas.
         * @param array  $values  An array of key => value.
         * @param array  $filters The filters to apply.
         *
         * @return array
         *
         * @access protected
         */
        protected function _update($data, $values, $filters = array()) {
            $result = $data['datas'];
            $insert = array();
            $current_datas = $data['datas'];

            if (count($filters) > 0) {
                $result = $this->_filter($data, $filters);
            }

            foreach ($result as $id => $res_line) {
                foreach ($values as $row => $value) {
                    $result[$id][$row] = $value;
                }
                foreach ($current_datas as $key => $line) {
                    if ($line['id'] == $res_line['id']) {
                        $data['datas'][$key] = $result[$id];
                    }
                }
            }

            foreach ($data['datas'] as $key => $line) {
                uksort($line, function($after, $now) use ($data) {
                    return array_search($now, $data['prototype']) < array_search($after, $data['prototype']);
                });
                $data['datas'][$key] = $line;
            }

            usort($data['datas'], function($after, $now) {
                return $now['id'] < $after['id'];
            });

            return $data;
        }

        /**
         * Filter datas
         *
         * @param array $data    The array of data to filter
         * @param array $filters The array of filters
         *
         * @return array
         *
         * @access protected
         *
         * @throws JSONQLException
         */
        protected function _filter($data, $filters) {
            $result = $data['datas'];
            $temp   = array();

            foreach ($filters as $filter) {
                foreach ($result as $line) {
                    if (!array_key_exists($filter['row'], $line)) {
                        throw new JSONQLException("JSONQL Syntax Error: The field \"{$filter['row']}\" doesn't exists in the table");
                    }
                    if (strtolower($filter['value']) == 'last_insert_id') {
                        $filter['value'] = $data['properties']['last_insert_id'];
                    }
                    switch ($filter['operator']) {
                        case '<':
                            if ($line[$filter['row']] < $filter['value']) {
                                $temp[$line['id']] = $line;
                            }
                        break;

                        case '<=':
                            if ($line[$filter['row']] <= $filter['value']) {
                                $temp[$line['id']] = $line;
                            }
                        break;

                        case '=':
                            if ($line[$filter['row']] == $filter['value']) {
                                $temp[$line['id']] = $line;
                            }
                        break;

                        case '>=':
                            if ($line[$filter['row']] >= $filter['value']) {
                                $temp[$line['id']] = $line;
                            }
                        break;

                        case '>':
                            if ($line[$filter['row']] > $filter['value']) {
                                $temp[$line['id']] = $line;
                            }
                        break;

                        case '<>':
                            if ($line[$filter['row']] != $filter['value']) {
                                $temp[$line['id']] = $line;
                            }
                        break;

                        default:
                            throw new JSONQLException('JSONQL Syntax Error: The operator "'.$filter['operator'].'" is not supported. Try to use one of these operators: <, <=, =, >=, >, <>.');
                        break;
                    }
                }
                $result = $temp;
                $temp = array();
            }

            return (array) $result;
        }

        /**
         * Parse a SELECT SQL query
         *
         * @param string $query The query to parse
         *
         * @return void
         *
         * @access protected
         *
         * @throws JSONQLException
         */
        protected function _parseSelectQuery($query) {
            $query_part = explode(' ', trim($query));
            $check_query_part = explode(' ', trim(strtolower($query)));
            if (!in_array('from', $check_query_part)) {
                throw new JSONQLException('JSONQL Query Parse Error : Missing the FROM parameter.');
            }
            else {
                $from_pos = array_search('from', $check_query_part);
                $not_parsed_rows = array_slice($query_part, 1, $from_pos-1);
                $rows = array();
                $filters = array();
                $from_to = array();
                foreach($not_parsed_rows as $row_parts) {
                    foreach(explode(',', $row_parts) as $row) {
                        $esc_row = trim($row, self::ESCAPE_STRING);
                        if (!empty($esc_row)) {
                            $rows[$esc_row] = $row;
                        }
                    }
                }
                if (in_array('limit', $check_query_part)) {
                    $limit_pos = array_search('limit', $check_query_part);
                    $limit_from_to = array_slice($query_part, $limit_pos+1);
                    foreach ($limit_from_to as $val) {
                        $val = intval(trim($val, ','));
                        if (strlen($val) > 0) {
                            $from_to[] = $val;
                        }
                    }
                }
                if (in_array('order', $check_query_part)) {
                    $by_pos = array_search('by', $check_query_part);
                    if (isset($limit_pos))
                        $order_by = array_slice($query_part, $by_pos+1, $limit_pos - $by_pos - 1);
                    else
                        $order_by = array_slice($query_part, $by_pos+1);
                }
                if (in_array('where', $check_query_part)) {
                    $where_pos = array_search('where', $check_query_part);
                    if (isset($by_pos))
                        $keys_and_values = array_slice($query_part, $where_pos+1, $by_pos - $where_pos - 2);
                    else
                        $keys_and_values = array_slice($query_part, $where_pos+1);
                    $keys_and_values = explode('AND', trim(implode(' ', $keys_and_values), self::ESCAPE_STRING));
                    foreach ($keys_and_values as $num => $part) {
                        foreach ($this->operators as $operator) {
                            if (in_array($operator, explode(' ', $part)) || in_array($operator, str_split($part))) {
                                $row_val = explode($operator, $part);
                                $filters[$num]['operator'] = $operator;
                                $filters[$num]['row'] = trim($row_val[0], self::ESCAPE_STRING);
                                $filters[$num]['value'] = trim($row_val[1], self::ESCAPE_STRING);
                                break;
                            }
                        }
                    }
                }
                if (count($rows) == 0) {
                    throw new JSONQLException('JSONQL Error: Cannot execute the query. No field selected.');
                }
                $this->main_query = 'select';
                $this->query_options = array(
                    'rows' => $rows,
                    'table' => $query_part[$from_pos+1],
                    'filters' => $filters,
                    'order_by' => isset($order_by[0]) ? $order_by[0] : 'id',
                    'order_method' => isset($order_by[1]) ? strtolower($order_by[1]) : 'asc',
                    'limit_from' => isset($from_to[0]) ? $from_to[0] : FALSE,
                    'limit_to' => isset($from_to[1]) ? $from_to[1] : FALSE,
                );
            }
        }

        /**
         * Parse an INSERT SQL query
         *
         * @param string $query The query to parse
         *
         * @return void
         *
         * @access protected
         *
         * @throws JSONQLException
         */
        protected function _parseInsertQuery($query) {
            $query_part = explode(' ', trim($query));
            $check_query_part = explode(' ', trim(strtolower($query)));
            if (!in_array('into', $check_query_part) ||
                (!in_array('values(', $check_query_part) && !in_array('value(', $check_query_part)
                && !in_array('values', $check_query_part) && !in_array('value', $check_query_part))) {
                throw new JSONQLException('JSONQL Query Parse Error: Missing some keywords like INTO or VALUE(s) in the query.');
            }
            else {
                $rows = array();
                $values = array();
                if (strpos($query_part[2], '(') !== FALSE) {
                    $explode_1 = explode('(', $query);
                    $explode_2 = explode(')', $explode_1[1]);
                    $not_parsed_rows = $explode_2[0];
                    foreach(explode(',', $not_parsed_rows) as $row) {
                        if (!empty(trim($row, self::ESCAPE_STRING))) {
                            $rows[] = trim($row, self::ESCAPE_STRING);
                        }
                    }
                }
                foreach (array('values', 'value') as $keyword) {
                    if (in_array($keyword, $check_query_part)) {
                        $explode_1 = explode($keyword, $query);
                        $explode_2 = explode(strtoupper($keyword), $query);
                        $temp = isset($explode_1[1]) ? $explode_1[1] : $explode_2[1];
                        break;
                    }
                }
                $index = 0;
                foreach (explode('(', $temp) as $val_big_part) {
                    foreach(explode(')', $val_big_part) as $val_part) {
                        foreach(explode(',', $val_part) as $value) {
                            if (!empty(trim($value, self::ESCAPE_STRING))) {
                                $values[$index][] = $this->_parseValue($value);
                            }
                        }
                    }
                    $index++;
                }
                $this->main_query = 'insert';
                $query_part_explode = explode('(', $query_part[2]);
                $this->query_options = array(
                    'table' => $query_part_explode[0],
                    'rows' => $rows,
                    'values' => $values
                );
            }
        }

        /**
         * Parse a DELETE SQL query
         *
         * @param string $query The query to parse
         *
         * @return void
         *
         * @access protected
         *
         * @throws JSONQLException
         */
        protected function _parseDeleteQuery($query) {
            $query_part = explode(' ', trim($query));
            $check_query_part = explode(' ', trim(strtolower($query)));
            if (!in_array('from', $check_query_part)) {
                throw new JSONQLException('JSONQL Query Parse Error: Missing the keyword FROM in the query.');
            }
            else {
                $filters = array();
                $from_pos = array_search('from', $check_query_part);
                if (in_array('where', $check_query_part)) {
                    $where_pos = array_search('where', $check_query_part);
                    $keys_and_values = array_slice($query_part, $where_pos+1);
                    $keys_and_values = explode('AND', trim(implode(' ', $keys_and_values), self::ESCAPE_STRING));
                    foreach ($keys_and_values as $num => $part) {
                        foreach ($this->operators as $operator) {
                            if (in_array($operator, explode(' ', $part)) || in_array($operator, str_split($part))) {
                                $row_val = explode($operator, $part);
                                $filters[$num]['operator'] = $operator;
                            }
                        }
                        $filters[$num]['row'] = trim($row_val[0], self::ESCAPE_STRING);
                        $filters[$num]['value'] = trim($row_val[1], self::ESCAPE_STRING);
                    }
                }
                $this->main_query = 'delete';
                $this->query_options = array(
                    'table' => $query_part[$from_pos+1],
                    'filters' => $filters
                );
            }
        }

        /**
         * Parse a UPDATE SQL query
         *
         * @param string $query The query to parse
         *
         * @return void
         *
         * @access protected
         *
         * @throws JSONQLException
         */
        protected function _parseUpdateQuery($query) {
            $query_part = explode(' ', trim($query));
            $check_query_part = explode(' ', trim(strtolower($query)));
            if (!in_array('set', $check_query_part)) {
                throw new JSONQLException('JSONQL Query Parse Error: Missing the keyword SET in the query.');
            }
            else {
                $filters = array();
                $set_pos = array_search('set', $check_query_part);
                if (in_array('where', $check_query_part)) {
                    $where_pos = 0;
                    $where_pos = array_search('where', $check_query_part);
                    $keys_and_values = array_slice($query_part, $where_pos+1);
                    $keys_and_values = explode('AND', trim(implode(' ', $keys_and_values), self::ESCAPE_STRING));
                    foreach ($keys_and_values as $num => $part) {
                        foreach ($this->operators as $operator) {
                            if (in_array($operator, explode(' ', $part)) || in_array($operator, str_split($part))) {
                                $row_val = explode($operator, $part);
                                $filters[$num]['operator'] = $operator;
                            }
                        }
                        $filters[$num]['row'] = trim($row_val[0], self::ESCAPE_STRING);
                        $filters[$num]['value'] = trim($row_val[1], self::ESCAPE_STRING);
                    }
                }
                if (isset($where_pos))
                    $keys_and_values = array_slice($query_part, $set_pos+1, $where_pos - $set_pos - 1);
                else
                    $keys_and_values = array_slice($query_part, $set_pos+1);
                $keys_and_values = explode(',', trim(implode(' ', $keys_and_values), self::ESCAPE_STRING));
                foreach ($keys_and_values as $part) {
                    $row_val = explode('=', $part);
                    $values[trim($row_val[0], self::ESCAPE_STRING)] = $this->_parseValue($row_val[1]);
                }
                $this->main_query = 'update';
                $this->query_options = array(
                    'table' => $query_part[1],
                    'filters' => $filters,
                    'values' => $values
                );
            }
        }

        /**
         * Parse a REPLACE SQL query
         *
         * @param string $query The query to parse.
         *
         * @return void
         *
         * @access protected
         *
         * @throws JSONException
         */
        protected function _parseReplaceQuery($query) {
            $query_part = explode(' ', trim($query));
            $check_query_part = explode(' ', trim(strtolower($query)));
            if (!in_array('into', $check_query_part) ||
                (!in_array('values(', $check_query_part) && !in_array('value(', $check_query_part)
                && !in_array('values', $check_query_part) && !in_array('value', $check_query_part))) {
                throw new JSONQLException('JSONQL Query Parse Error: Missing some keywords like INTO or VALUE(s) in the query.');
            }
            else {
                $rows = array();
                $values = array();
                if (strpos($query_part[2], '(') !== FALSE) {
                    $explode_1 = explode('(', $query);
                    $explode_2 = explode(')', $explode_1[1]);
                    $not_parsed_rows = $explode_2[0];
                    foreach(explode(',', $not_parsed_rows) as $row) {
                        if (!empty(trim($row, self::ESCAPE_STRING))) {
                            $rows[] = trim($row, self::ESCAPE_STRING);
                        }
                    }
                }
                foreach (array('values', 'value') as $keyword) {
                    if (in_array($keyword, $check_query_part)) {
                        $explode_1 = explode($keyword, $query);
                        $explode_2 = explode(strtoupper($keyword), $query);
                        $temp = isset($explode_1[1]) ? $explode_1[1] : $explode_2[1];
                        break;
                    }
                }
                $index = 0;
                foreach (explode('(', $temp) as $val_big_part) {
                    foreach(explode(')', $val_big_part) as $val_part) {
                        foreach(explode(',', $val_part) as $value) {
                            if (!empty(trim($value, self::ESCAPE_STRING))) {
                                $values[$index][] = $this->_parseValue($value);
                            }
                        }
                    }
                    $index++;
                }
                $this->main_query = 'replace';
                $query_part_explode = explode('(', $query_part[2]);
                $this->query_options = array(
                    'table' => $query_part_explode[0],
                    'rows' => $rows,
                    'values' => $values
                );
            }
        }

        /**
         * Parse a TRUNCATE SQL query
         *
         * @param string $query The query to parse.
         *
         * @return void
         *
         * @access protected
         *
         * @throws JSONQLException
         */
        protected function _parseTruncateQuery($query) {
            $query_part = explode(' ', trim($query));
            if (count($query_part) != 2) {
                throw new JSONQLException('JSONQL Query Parse Error: Malformed TRUNCATE query.');
            }
            else {
                $this->main_query    = 'truncate';
                $this->query_options = array(
                    'table' => trim($query_part[2], self::ESCAPE_STRING)
                );
            }
        }

        /**
         * Parse a value
         *
         * Determine if a value is a string, an integer,
         * or a boolean.
         *
         * @param string $value The value to parse.
         *
         * @return string|int|bool
         *
         * @access protected
         */
        protected function _parseValue($value) {
            $trim_value = trim($value, ' ');
            if (strpos($value, ":JSONQL::TO_BOOL:") !== FALSE) {
                return boolval(intval(str_replace(":JSONQL::TO_BOOL:", '', $value)));
            }
            elseif ($trim_value[0] == "'" && $trim_value[strlen($trim_value)-1] == "'") {
                return strval(trim($value, self::ESCAPE_STRING));
            }
            else {
                return intval(trim($value, self::ESCAPE_STRING));
            }
        }

        /**
         * Check if the query is prepared.
         *
         * @return bool
         *
         * @access protected
         */
        protected function _queryIsPrepared() {
            return $this->queryIsPrepared === TRUE;
        }

        /**
         * Check if the query is executed.
         *
         * @return bool
         *
         * @access protected
         */
        protected function _queryIsExecuted() {
            return $this->queryIsExecuted === TRUE;
        }

    }

    /**
     * JSONQLException
     *
     * @author Axel Nana
     * @package FlatOS
     * @subpackage System
     */
    class JSONQLException extends \Exception { }
