<?php
session_start();
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($_SESSION['id_utilisateur'])) {
    echo json_encode(["success" => false, "message" => "Utilisateur non connecté"]);
    exit;
}

$id_utilisateur = $_SESSION['id_utilisateur'];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    
    $nom = isset($_POST["nom"]) ? $_POST["nom"] : null;
    $prenom = isset($_POST["prenom"]) ? $_POST["prenom"] : null;
    $age = isset($_POST["age"]) ? $_POST["age"] : null;
    $role_entreprise = isset($_POST["role_entreprise"]) ? $_POST["role_entreprise"] : null;
    $secteur = isset($_POST["secteur"]) ? $_POST["secteur"] : null;
    $id_superieur = isset($_POST["id_superieur"]) && $_POST["id_superieur"] !== '' ? $_POST["id_superieur"] : null;

    if (!$nom || !$prenom || !$age || !$role_entreprise) {
        echo json_encode(["success" => false, "message" => "Champs obligatoires manquants"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Insertion de l'acteur
        $stmt = $pdo->prepare("INSERT INTO acteur (nom, prenom, age, role_entreprise, secteur, id_utilisateur)
                               VALUES (:nom, :prenom, :age, :role_entreprise, :secteur, :id_utilisateur)");
        $stmt->execute([
            'nom' => $nom,
            'prenom' => $prenom,
            'age' => $age,
            'role_entreprise' => $role_entreprise,
            'secteur' => $secteur,
            'id_utilisateur' => $id_utilisateur
        ]);

        $id_acteur = $pdo->lastInsertId();

        // Si un supérieur est défini, on insère une relation
        if ($id_superieur !== null) {
            $stmtRel = $pdo->prepare("INSERT INTO relation_hierarchique (id_acteur_source, id_acteur_superieur)
                                      VALUES (:id_acteur_source, :id_acteur_superieur)");
            $stmtRel->execute([
                'id_acteur_source' => $id_acteur,
                'id_acteur_superieur' => $id_superieur
            ]);
        }

        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Acteur ajouté avec succès"]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Erreur : " . $e->getMessage()]);
    }
}
?>
