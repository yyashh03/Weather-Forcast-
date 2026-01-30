<?php
// weather.php

// 1. Disable PHP warnings so they don't break the JSON response
error_reporting(0); 

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// --- CONFIGURATION ---
$apiKey = "196b394cce455ac41d8fea5130d83f75"; // <--- MAKE SURE YOUR KEY IS PASTED HERE!
$cacheDuration = 3600; 

$city = isset($_GET['city']) ? htmlspecialchars($_GET['city']) : '';

if (empty($city)) {
    echo json_encode(["error" => "City name is empty"]);
    exit;
}

// --- HELPER FUNCTION FOR XAMPP (Fixes SSL Issues) ---
function fetchUrl($url) {
    $arrContextOptions=array(
        "ssl"=>array(
            "verify_peer"=>false,
            "verify_peer_name"=>false,
        ),
        "http" => array(
            "ignore_errors" => true // Capture error codes like 404
        )
    );
    return file_get_contents($url, false, stream_context_create($arrContextOptions));
}

// --- CACHE HANDLING ---
if (!file_exists('cache')) { mkdir('cache', 0777, true); }
$cacheFile = "cache/" . md5(strtolower($city)) . "_full.json";

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheDuration)) {
    echo file_get_contents($cacheFile);
    exit;
}

// --- FETCH DATA (Current + Forecast) ---
$currentUrl = "https://api.openweathermap.org/data/2.5/weather?q=" . urlencode($city) . "&appid=" . $apiKey . "&units=metric";
$currentData = fetchUrl($currentUrl); // Using our new helper function

$forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" . urlencode($city) . "&appid=" . $apiKey . "&units=metric";
$forecastData = fetchUrl($forecastUrl); // Using our new helper function

// Check if the API returned valid JSON
$currentJson = json_decode($currentData, true);
$forecastJson = json_decode($forecastData, true);

if (!$currentJson || $currentJson['cod'] != 200) {
    // Output the specific error from the API for debugging
    $msg = isset($currentJson['message']) ? $currentJson['message'] : "Failed to connect to API";
    echo json_encode(["error" => $msg]);
    exit;
}

// --- MERGE & SAVE ---
$finalResponse = [
    "current" => $currentJson,
    "forecast" => $forecastJson,
    "source" => "live"
];

file_put_contents($cacheFile, json_encode($finalResponse));

echo json_encode($finalResponse);
?>