<?php
session_start(); // Démarrer la session pour récupérer les valeurs stockées

if (isset($_SESSION["userId"])) {
    echo json_encode([
        "success" => true,
        "userId" => $_SESSION["userId"],
        "nom" => $_SESSION["nom"],
        "prenom" => $_SESSION["prenom"]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Aucun utilisateur connecté."]);
}
?>
