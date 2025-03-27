<?php
session_start();

if (isset($_SESSION['id_utilisateur'])) {
    echo json_encode([
        "success" => true,
        "userId" => $_SESSION['id_utilisateur'],
        "nom" => $_SESSION['nom'],
        "prenom" => $_SESSION['prenom']
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Aucun utilisateur connecté."]);
}
?>
