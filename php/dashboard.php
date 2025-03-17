<?php
include 'config.php';

// Définition des en-têtes HTTP pour retourner du JSON
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Requête SQL pour récupérer les acteurs et leurs relations hiérarchiques
$sql = "SELECT 
            a.id_acteur, 
            a.nom, 
            a.prenom, 
            a.age, 
            a.role_entreprise, 
            a.secteur, 
            r.id_acteur_superieur
        FROM acteur a
        LEFT JOIN relation_hierarchique r ON a.id_acteur = r.id_acteur_source";

try {
    $stmt = $pdo->query($sql);
    if (!$stmt) {
        throw new Exception("Erreur SQL: " . $pdo->errorInfo()[2]);
    }

    $acteurs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Correction des valeurs NULL pour éviter les erreurs
    foreach ($acteurs as &$acteur) {
        if ($acteur["id_acteur_superieur"] === null) {
            $acteur["id_acteur_superieur"] = ""; // Les patrons doivent avoir ""
        }
    }

    echo json_encode($acteurs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
