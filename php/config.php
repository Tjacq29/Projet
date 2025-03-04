<?php
$host = "localhost"; // Ne change pas si tu es en local
$dbname = "projet_m1"; // Mets le nom de ta base
$username = "root"; // L'utilisateur par défaut est "root"
$password = ""; // Laisse vide si tu utilises XAMPP/MAMP par défaut

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connexion réussie !";
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
