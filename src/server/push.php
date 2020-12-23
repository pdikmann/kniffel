<?php
$jsonString = file_get_contents("php://input");
if (strlen($jsonString) > 634) exit('{ "success": false, "error": "session file too big" }');
$stripped = basename(trim($_GET['session']));
$myFile = "../../session/".$stripped.".json";
if (file_put_contents($myFile, $jsonString)) {
  echo '{ "success": true }';
}
else {
  echo '{ "success": false, "error": "cannot write session" }';
}
?>
