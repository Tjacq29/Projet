<?php
// dashboard.php corrigé et propre
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");

session_start();

if (!isset($_SESSION['id_utilisateur'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Utilisateur non connecté"]);
    exit;
}

require_once 'config.php';
$id_utilisateur = $_SESSION['id_utilisateur'];

try {
    // Récupère tous les acteurs + relations hiérarchiques
    $stmt = $pdo->prepare("SELECT 
            a.id_acteur, 
            a.nom, 
            a.prenom, 
            a.age, 
            a.role_entreprise, 
            a.secteur,
            r.id_acteur_superieur
        FROM acteur a
        LEFT JOIN relation_hierarchique r ON a.id_acteur = r.id_acteur_source
        WHERE a.id_utilisateur = :id_utilisateur");

    $stmt->execute(['id_utilisateur' => $id_utilisateur]);
    $acteurs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Nettoie les NULL pour les remplacer par ""
    foreach ($acteurs as &$acteur) {
        foreach ($acteur as $key => $value) {
            if (is_null($value)) {
                $acteur[$key] = "";
            }
        }
    }
    unset($acteur); // Très important !

    echo json_encode($acteurs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
