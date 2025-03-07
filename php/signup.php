<?php 
include 'config.php';

if (isset($_POST['submit'])) {
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];  
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Vérifier si l'email existe déjà dans la base de données
    $checkEmail = $pdo->prepare("SELECT COUNT(*) FROM utilisateur WHERE email = :email");
    $checkEmail->execute(['email' => $email]);
    $emailExists = $checkEmail->fetchColumn();

    if ($emailExists > 0) {
        echo "Erreur : cet email est déjà utilisé.";
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $request = $pdo->prepare("INSERT INTO utilisateur (email, mot_de_passe, nom, prenom) VALUES (:email, :mot_de_passe, :nom, :prenom)");
        $request->execute(
            array(
                'email' => $email,
                'mot_de_passe' => $hashed_password, 
                'nom' => $lastname,
                'prenom' => $firstname
            )
        );

        echo "Inscription réussie !";
        header('Location: ../html/login.html'); 
        exit();
    }
}
?>
