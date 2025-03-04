<?php
// Activer l'affichage des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'config.php'; // Connexion à la base de données

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_POST["nom"], $_POST["email"], $_POST["password"])) {
        die("❌ Erreur : Tous les champs sont requis !");
    }

    $nom = htmlspecialchars($_POST["nom"]);
    $email = htmlspecialchars($_POST["email"]);
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT); // Hachage du mot de passe

    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->rowCount() > 0) {
        die(" Cet email est déjà utilisé !");
    }

    // Insérer l'utilisateur
    $stmt = $pdo->prepare("INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES (?, ?, ?)");
    if ($stmt->execute([$nom, $email, $password])) {
        echo " Inscription réussie ! <a href='login.html'>Se connecter</a>";
    } else {
        echo " Erreur lors de l'inscription.";
    }
} else {
    die(" Erreur : Accès non autorisé.");
}
?>
