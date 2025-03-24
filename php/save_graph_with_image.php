<?php
include 'config.php';
header('Content-Type: application/json');
session_start();

if (!isset($_POST['id_utilisateur']) || !isset($_POST['json']) || !isset($_FILES['image'])) {
    echo json_encode(["success" => false, "message" => "Champs manquants."]);
    exit();
}

$id_utilisateur = $_POST['id_utilisateur'];
$json_data = $_POST['json'];
$image = $_FILES['image'];

$timestamp = time();
$dir = "../schemas/";
$img_dir = $dir . "img/";

if (!file_exists($dir)) mkdir($dir, 0777, true);
if (!file_exists($img_dir)) mkdir($img_dir, 0777, true);

try {
    $stmt = $pdo->prepare("SELECT nom, prenom FROM utilisateur WHERE id_utilisateur = :id");
    $stmt->execute(['id' => $id_utilisateur]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Utilisateur introuvable."]);
        exit();
    }

    $prenom = preg_replace('/\\s+/', '_', $user['prenom']);
    $nom = preg_replace('/\\s+/', '_', $user['nom']);

    $filename_base = "{$prenom}_{$nom}_{$timestamp}";
    $json_path = $dir . $filename_base . ".json";
    $img_path = $img_dir . $filename_base . ".png";

    file_put_contents($json_path, $json_data);

    if (!move_uploaded_file($image['tmp_name'], $img_path)) {
        echo json_encode(["success" => false, "message" => "Erreur lors de l'enregistrement de l'image."]);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO schema_table (id_utilisateur, nom, type_schema, actif, date_time) 
                           VALUES (:id, :nom, :type, 1, NOW())");

    $stmt->execute([
        'id' => $id_utilisateur,
        'nom' => $filename_base,
        'type' => 'hierarchique'
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Schéma enregistré avec succès.",
        "nom_fichier" => $filename_base
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur SQL : " . $e->getMessage()
    ]);
}
?>
