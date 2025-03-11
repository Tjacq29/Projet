<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id_acteur = $_POST["id_acteur"];
    $nom = $_POST["nom"];
    $prenom = $_POST["prenom"];
    $age = $_POST["age"];
    $role_entreprise = $_POST["role_entreprise"];
    $secteur = $_POST["secteur"];
    $id_superieur = !empty($_POST["id_superieur"]) ? $_POST["id_superieur"] : NULL;

    try {
        $pdo->beginTransaction();

        // 🔹 Mettre à jour les informations de l'acteur
        $sql = "UPDATE acteur 
                SET nom = :nom, prenom = :prenom, age = :age, 
                    role_entreprise = :role_entreprise, secteur = :secteur
                WHERE id_acteur = :id_acteur";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            "id_acteur" => $id_acteur,
            "nom" => $nom,
            "prenom" => $prenom,
            "age" => $age,
            "role_entreprise" => $role_entreprise,
            "secteur" => $secteur
        ]);

        // 🔹 Vérifier si une relation hiérarchique existe déjà pour cet acteur
        $sqlCheckRelation = "SELECT id_acteur_superieur FROM relation_hierarchique WHERE id_acteur_source = :id_acteur";
        $stmtCheck = $pdo->prepare($sqlCheckRelation);
        $stmtCheck->execute(["id_acteur" => $id_acteur]);
        $existingRelation = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($existingRelation) {
            if ($id_superieur === NULL) {
                // 🔹 Supprimer la relation si l'acteur n'a plus de supérieur
                $sqlDeleteRelation = "DELETE FROM relation_hierarchique WHERE id_acteur_source = :id_acteur";
                $stmtDelete = $pdo->prepare($sqlDeleteRelation);
                $stmtDelete->execute(["id_acteur" => $id_acteur]);
            } elseif ($existingRelation["id_acteur_superieur"] != $id_superieur) {
                // 🔹 Mettre à jour la relation si le supérieur a changé
                $sqlUpdateRelation = "UPDATE relation_hierarchique 
                                      SET id_acteur_superieur = :id_superieur 
                                      WHERE id_acteur_source = :id_acteur";
                $stmtUpdate = $pdo->prepare($sqlUpdateRelation);
                $stmtUpdate->execute([
                    "id_acteur" => $id_acteur,
                    "id_superieur" => $id_superieur
                ]);
            }
        } else {
            if ($id_superieur !== NULL) {
                // 🔹 Ajouter une nouvelle relation si l'acteur a un supérieur
                $sqlInsertRelation = "INSERT INTO relation_hierarchique (id_acteur_source, id_acteur_superieur) 
                                      VALUES (:id_acteur, :id_superieur)";
                $stmtInsert = $pdo->prepare($sqlInsertRelation);
                $stmtInsert->execute([
                    "id_acteur" => $id_acteur,
                    "id_superieur" => $id_superieur
                ]);
            }
        }

        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Acteur modifié avec succès"]);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Erreur : " . $e->getMessage()]);
    }
}
?>
