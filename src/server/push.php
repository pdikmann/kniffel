<?php
$jsonString = file_get_contents("php://input");
$myFile = "../../db/state.json";
if (file_put_contents($myFile, $jsonString)) {
  echo '{ "success": true }';
}
else {
  echo '{ "success": false }';
}
?>
