<?php
$file = __DIR__ . '/../js/ressources/colors.json';


// Logique de lecture/écriture
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

	$currentData = json_decode(file_get_contents($file), true) ?: [];
	$newEntry = json_decode(file_get_contents('php://input'), true);

	if ($newEntry) {
		$updatedData = array_merge($currentData, $newEntry);
		file_put_contents($file, json_encode($updatedData, JSON_PRETTY_PRINT));
	}
	exit;
}

// Mode GET
header('Content-Type: application/json');
if (file_exists($file)) {
	echo file_get_contents($file);
} else {
	echo json_encode([]);
}
