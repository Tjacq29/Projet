<?php
session_start();

// Si l'utilisateur est connecté, on redirige vers la page d'accueil
if (isset($_SESSION['id_utilisateur'])) {
    header("Location: index.html");
    exit;
} else {
    // Sinon, vers la page de login
    header("Location: login.html");
    exit;
}
?>
