<?php
include 'config.php';

// En-têtes pour l'API JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Requête SQL pour récupérer les acteurs et leurs relations hiérarchiques
$query = "
    SELECT a.id_acteur, a.nom, a.prenom, a.age, a.role_entreprise, a.secteur, r.id_acteur_superieur 
    FROM acteur a 
    LEFT JOIN relation_hierarchique r ON a.id_acteur = r.id_acteur_source
";

try {
    $result = $pdo->query($query);
    $acteurs = $result->fetchAll(PDO::FETCH_ASSOC);  // Récupérer directement toutes les données
    echo json_encode($acteurs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(["error" => "Erreur SQL : " . $e->getMessage()]);
}
?>
