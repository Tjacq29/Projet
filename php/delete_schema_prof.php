<?php
session_start();
include 'config.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'prof') {
    echo json_encode(["success" => false, "message" => "Accès refusé"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id_schema'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "ID manquant"]);
    exit();
}

$stmt = $pdo->prepare("DELETE FROM schema_table WHERE id_schema = ?");
$success = $stmt->execute([$id]);

echo json_encode(["success" => $success]);
