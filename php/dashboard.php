<?php
include 'config.php';

// 🔹 Requête SQL avec une jointure pour récupérer l'ID du supérieur
$sql = "SELECT a.id_acteur, a.nom, a.prenom, a.age, a.role_entreprise, a.secteur, 
               r.id_acteur_superieur
        FROM acteur a
        LEFT JOIN relation_hierarchique r ON a.id_acteur = r.id_acteur_source";

$result = $pdo->query($sql);

if (!$result) {
    die(json_encode(["success" => false, "message" => "Erreur SQL: " . $pdo->errorInfo()[2]]));
}

// Convertir le résultat en JSON pour le JavaScript
$acteurs = $result->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($acteurs);
?>
