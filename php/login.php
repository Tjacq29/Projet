<?php
session_start();
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];

    if (!empty($email) && !empty($password)) {
        $stmt = $pdo->prepare("SELECT * FROM utilisateur WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['mot_de_passe'])) {
            //  Stocker l'utilisateur dans la session
            $_SESSION["id_utilisateur"] = $user['id_utilisateur']; 
            $_SESSION["nom"] = $user['nom'];
            $_SESSION["prenom"] = $user['prenom'];
            $_SESSION['role'] = $user['role']; 


            //  Réponse JSON pour frontend
            echo json_encode([
                "success" => true,
                "userId" => $_SESSION["id_utilisateur"],
                "nom" => $_SESSION["nom"],
                "prenom" => $_SESSION["prenom"],
                "role" => $user["role"] 
            ]);
            exit;
        } else {
            echo json_encode(["success" => false, "message" => "Email ou mot de passe incorrect."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Veuillez remplir tous les champs."]);
    }
}
?>
