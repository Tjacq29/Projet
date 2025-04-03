<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
include 'config.php';

if (!isset($_SESSION['id_utilisateur'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit();
}

$id_utilisateur = $_SESSION['id_utilisateur'];

try {
    $sql = "SELECT * FROM relation_informelle WHERE id_utilisateur = :id_utilisateur";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id_utilisateur' => $id_utilisateur]);

    $relations = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $relations[] = [
            "id_relation_informelle" => $row["id_relation_informelle"],
            "id_acteur_source" => $row["id_acteur_source"],
            "id_acteur_cible" => $row["id_acteur_cible"],
            "type_relation" => $row["type_relation"],
            "direction_relation" => $row["direction_relation"],
            "impact_source_vers_cible" => $row["impact_source_vers_cible"],
            "impact_cible_vers_source" => $row["impact_cible_vers_source"],
            "nature_relation" => $row["nature_relation"],
            "duree_relation" => $row["duree_relation"]
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($relations, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(["error" => "Erreur SQL : " . $e->getMessage()]);
}
