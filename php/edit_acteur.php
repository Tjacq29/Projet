<?php
session_start();
include 'config.php';
header('Content-Type: application/json');

if (!isset($_SESSION["id_utilisateur"])) {
    echo json_encode(["success" => false, "message" => "Utilisateur non connecté"]);
    exit();
}

$id_utilisateur = $_SESSION["id_utilisateur"];


$id_acteur = isset($_POST["id_acteur"]) ? $_POST["id_acteur"] : null;
$nom = isset($_POST["nom"]) ? $_POST["nom"] : null;
$prenom = isset($_POST["prenom"]) ? $_POST["prenom"] : null;
$age = isset($_POST["age"]) ? $_POST["age"] : null;
$role_entreprise = isset($_POST["role_entreprise"]) ? $_POST["role_entreprise"] : null;
$secteur = isset($_POST["secteur"]) ? $_POST["secteur"] : null;
$id_superieur = isset($_POST["id_superieur"]) && $_POST["id_superieur"] !== '' ? $_POST["id_superieur"] : null;

try {
    $check = $pdo->prepare("SELECT * FROM acteur WHERE id_acteur = :id_acteur AND id_utilisateur = :id_utilisateur");
    $check->execute(["id_acteur" => $id_acteur, "id_utilisateur" => $id_utilisateur]);

    if (!$check->fetch()) {
        echo json_encode(["success" => false, "message" => "Modification interdite : acteur non trouvé ou non autorisé."]);
        exit();
    }

    // Mise à jour des infos de l’acteur
    $stmt = $pdo->prepare("UPDATE acteur SET nom = :nom, prenom = :prenom, age = :age, 
                          role_entreprise = :role_entreprise, secteur = :secteur 
                          WHERE id_acteur = :id_acteur");
    $stmt->execute([
        "nom" => $nom,
        "prenom" => $prenom,
        "age" => $age,
        "role_entreprise" => $role_entreprise,
        "secteur" => $secteur,
        "id_acteur" => $id_acteur
    ]);

    // Mise à jour ou insertion dans la table relation_hierarchique
    $checkRel = $pdo->prepare("SELECT * FROM relation_hierarchique WHERE id_acteur_source = :id_acteur_source");
    $checkRel->execute(["id_acteur_source" => $id_acteur]);

    if ($checkRel->rowCount() > 0) {
        $update = $pdo->prepare("UPDATE relation_hierarchique SET id_acteur_superieur = :id_superieur WHERE id_acteur_source = :id_acteur_source");
    } else {
        $update = $pdo->prepare("INSERT INTO relation_hierarchique (id_acteur_source, id_acteur_superieur) VALUES (:id_acteur_source, :id_superieur)");
    }

    $update->execute([
        "id_superieur" => $id_superieur,
        "id_acteur_source" => $id_acteur
    ]);

    echo json_encode(["success" => true, "message" => "Acteur modifié avec succès"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Erreur : " . $e->getMessage()]);
}
?>
