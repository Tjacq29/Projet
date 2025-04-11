<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
include 'config.php';

// Vérifie que l'utilisateur est connecté
if (!isset($_SESSION['id_utilisateur'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit();
}

$id_utilisateur = $_SESSION['id_utilisateur'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Méthode non autorisée"]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    echo json_encode(["error" => "Format des données incorrect"]);
    exit();
}

try {
    $sql = "INSERT INTO relation_informelle (
        id_acteur_source, id_acteur_cible, type_relation,
        direction_relation, impact_source_vers_cible,
        impact_cible_vers_source, nature_relation, duree_relation,
        id_utilisateur
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $inserted = 0;

    foreach ($data as $relation) {
        if (!isset($relation['source'], $relation['target'])) continue;

        $stmt->execute([
            $relation["source"],
            $relation["target"],
            $relation["type_relation"],
            $relation["direction"],
            $relation["impact_source_vers_cible"],
            $relation["impact_cible_vers_source"],
            $relation["nature_relation"],
            $relation["duree_relation"],
            $id_utilisateur
        ]);
        $inserted++;
    }

    echo json_encode(["success" => true, "relations_inserted" => $inserted]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
