<?php
session_start();
include 'config.php';

if (!isset($_SESSION['id_utilisateur'])) {
    echo json_encode(["success" => false, "message" => "Utilisateur non connecté"]);
    exit;
}

$id_utilisateur = $_SESSION['id_utilisateur'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $_POST["nom"];
    $prenom = $_POST["prenom"];
    $age = $_POST["age"];
    $role_entreprise = $_POST["role_entreprise"];
    $secteur = $_POST["secteur"];
    $id_superieur = !empty($_POST["id_superieur"]) ? $_POST["id_superieur"] : NULL;

    try {
        $pdo->beginTransaction();

        // Insérer l'acteur lié à l'utilisateur
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

        // Si un supérieur est défini, insérer la relation hiérarchique dans un schéma actif
        if ($id_superieur) {
            // Récupérer le schéma actif de l'utilisateur
            $stmt_schema = $pdo->prepare("SELECT id_schema FROM schema WHERE id_utilisateur = :id_utilisateur AND actif = 1 LIMIT 1");
            $stmt_schema->execute(['id_utilisateur' => $id_utilisateur]);
            $schema = $stmt_schema->fetch();

            if ($schema) {
                $id_schema = $schema['id_schema'];

                $stmt2 = $pdo->prepare("INSERT INTO relation_hierarchique (id_schema, id_acteur_source, id_acteur_superieur) 
                                        VALUES (:id_schema, :id_acteur, :id_superieur)");
                $stmt2->execute([
                    'id_schema' => $id_schema,
                    'id_acteur' => $id_acteur,
                    'id_superieur' => $id_superieur
                ]);
            } else {
                throw new Exception("Aucun schéma actif trouvé pour l'utilisateur.");
            }
        }

        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Acteur ajouté avec succès"]);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Erreur : " . $e->getMessage()]);
    }
}
?>
