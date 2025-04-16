<?php
include 'config.php';
header('Content-Type: application/json');
session_start();

// Vérifie les champs obligatoires
if (!isset($_POST['id_utilisateur']) || !isset($_FILES['image']) || !isset($_POST['type_schema'])) {
    echo json_encode(["success" => false, "message" => "Champs manquants."]);
    exit();
}

$id_utilisateur = $_POST['id_utilisateur'];
$type_schema = $_POST['type_schema'];
$nom_schema = isset($_POST['nom']) ? $_POST['nom'] : "schema_" . time(); // fallback si pas de nom
$image = $_FILES['image'];

$dir = "../schemas/";
$img_dir = $dir . "img/";

if (!file_exists($dir)) mkdir($dir, 0777, true);
if (!file_exists($img_dir)) mkdir($img_dir, 0777, true);

try {
    // Récup info utilisateur
    $stmt = $pdo->prepare("SELECT nom, prenom FROM utilisateur WHERE id_utilisateur = :id");
    $stmt->execute(['id' => $id_utilisateur]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Utilisateur introuvable."]);
        exit();
    }

    // Utiliser le nom donné comme base du nom de fichier
    $filename_base = $nom_schema;
    $img_path = $img_dir . $filename_base . ".png";

    // Sauvegarder l'image
    if (!move_uploaded_file($image['tmp_name'], $img_path)) {
        echo json_encode(["success" => false, "message" => "Erreur lors de l'enregistrement de l'image."]);
        exit();
    }

    // Insérer dans la table `schema` avec le nom du fichier image
    $stmt = $pdo->prepare("INSERT INTO schema_table 
        (id_utilisateur, nom, type_schema, actif, date_time, nom_fichier) 
        VALUES (:id, :nom, :type, 1, NOW(), :fichier)");

    $stmt->execute([
        'id' => $id_utilisateur,
        'nom' => $nom_schema,
        'type' => $type_schema,
        'fichier' => $filename_base . ".png"
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Schéma enregistré avec succès.",
        "nom_fichier" => $filename_base . ".png"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur SQL : " . $e->getMessage()
    ]);
}
?>
