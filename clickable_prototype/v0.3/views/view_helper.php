<?php
    
    /**
     * DOCU: Load a file using the absolute file URI based on the `views` folder location 
     */
    function add_file($file_url){
        echo BASE_FILE_URL . $file_url;
    }