<?php
include 'config.php';

// En-têtes JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$query = "
    SELECT 
        a.id_acteur AS `key`, 
        a.nom, 
        a.prenom, 
        a.age,
        a.role_entreprise AS role, 
        a.secteur,
        r.id_acteur_superieur AS parent 
    FROM acteur a 
    LEFT JOIN relation_hierarchique r ON a.id_acteur = r.id_acteur_source
";

try {
    $result = $pdo->query($query);
    $acteurs = $result->fetchAll(PDO::FETCH_ASSOC);

    // Corrige les valeurs null pour éviter les erreurs dans GoJS
    foreach ($acteurs as &$acteur) {
        if ($acteur["parent"] === null) {
            $acteur["parent"] = "";
        }
    }

    echo json_encode($acteurs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(["error" => "Erreur SQL : " . $e->getMessage()]);
}
?>
