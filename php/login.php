<?php
error_log("login.php");
session_start();
include 'config.php'; // Ou require 'config.php';
echo("krfjief");
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    if (!empty($email) && !empty($password)) {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        try {
            $stmt = $pdo->prepare("INSERT INTO utilisateur (email, mot_de_passe) VALUES (:email, :mot_de_passe)");
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':mot_de_passe', $passwordHash);
            $stmt->execute();
            echo "connexion réussie !";
        } catch (PDOException $e) {
            echo "Erreur : " . $e->getMessage();
        }
    } else {
        echo "Veuillez remplir tous les champs.";
    }
}
?>
