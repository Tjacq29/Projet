<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Méthode non autorisée"]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["error" => "Données invalides"]);
    exit();
}

try {
    $sql = "INSERT INTO relation_informelle (
                id_acteur_source, id_acteur_cible, type_relation,
                direction_relation, impact_source_vers_cible,
                impact_cible_vers_source, nature_relation, duree_relation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data["id_acteur_source"],
        $data["id_acteur_cible"],
        $data["type_relation"],
        $data["direction_relation"],
        $data["impact_source_vers_cible"],
        $data["impact_cible_vers_source"],
        $data["nature_relation"],
        $data["duree_relation"]
    ]);

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>