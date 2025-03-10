<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $_POST["nom"];
    $prenom = $_POST["prenom"];
    $age = $_POST["age"];
    $role_entreprise = $_POST["role_entreprise"];
    $secteur = $_POST["secteur"];
    $id_superieur = !empty($_POST["id_superieur"]) ? $_POST["id_superieur"] : NULL;

    try {
        $pdo->beginTransaction();

        // Insérer l'acteur
        $stmt = $pdo->prepare("INSERT INTO acteur (nom, prenom, age, role_entreprise, secteur) 
                               VALUES (:nom, :prenom, :age, :role_entreprise, :secteur)");
        $stmt->execute([
            'nom' => $nom,
            'prenom' => $prenom,
            'age' => $age,
            'role_entreprise' => $role_entreprise,
            'secteur' => $secteur
        ]);

        $id_acteur = $pdo->lastInsertId();

        // Insérer la relation hiérarchique si un supérieur est défini
        if ($id_superieur) {
            $stmt2 = $pdo->prepare("INSERT INTO relation_hierarchique (id_acteur_source, id_acteur_superieur) 
                                    VALUES (:id_acteur, :id_superieur)");
            $stmt2->execute([
                'id_acteur' => $id_acteur,
                'id_superieur' => $id_superieur
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
