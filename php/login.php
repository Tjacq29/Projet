<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];

    if (!empty($email) && !empty($password)) {
        // Requête sécurisée avec prepared statements
        $stmt = $pdo->prepare("SELECT * FROM utilisateur WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        // Vérifier si un utilisateur existe et si le mot de passe correspond
        if ($user && password_verify($password, $user['mot_de_passe'])) {
            echo "Vous êtes connecté !";
            header('Location: ../html/index.html');
            exit(); 
        } else {
            echo "Erreur : email ou mot de passe incorrect.";
        }
    } else {
        echo "Veuillez remplir tous les champs.";
    }
}
?>
