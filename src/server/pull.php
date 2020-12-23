<?php
$stripped = basename(trim($_GET['session']));
$myFile = "../../session/".$stripped.".json";
$jsonString = file_get_contents($myFile);
header('Content-type: application/json');
echo $jsonString;
?>
