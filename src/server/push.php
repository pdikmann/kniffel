<?php
$jsonString = file_get_contents("php://input");
$stripped = basename(trim($_GET['session']));
$myFile = "../../session/".$stripped.".json";
if (file_put_contents($myFile, $jsonString)) {
  echo '{ "success": true }';
}
else {
  echo '{ "success": false }';
}
?>
