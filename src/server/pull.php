<?php
$myFile = "../../db/state.json";
$jsonString = file_get_contents($myFile);
header('Content-type: application/json');
echo $jsonString;
?>
