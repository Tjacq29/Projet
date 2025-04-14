<?php
// fiche_acteur.php
header('Content-Type: application/json');
require_once('../php/config.php');
session_start();

$id_acteur = isset($_GET['id_acteur']) ? intval($_GET['id_acteur']) : 0;
if ($id_acteur === 0) {
  echo json_encode(["error" => "Aucun acteur valide."]);
  exit;
}

if (!isset($_SESSION['id_utilisateur'])) {
  echo json_encode(["error" => "Utilisateur non connecté"]);
  exit;
}

$id_utilisateur = $_SESSION['id_utilisateur'];

// Vérification que l'acteur appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT nom, prenom FROM acteur WHERE id_acteur = ? AND id_utilisateur = ?");
$stmt->execute([$id_acteur, $id_utilisateur]);
$acteur_info = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$acteur_info) {
  echo json_encode(["error" => "Acteur non autorisé ou inexistant"]);
  exit;
}

$nom_acteur = $acteur_info['prenom'] . ' ' . $acteur_info['nom'];

// Relations informelles 
$stmt = $pdo->prepare("SELECT 
    a2.nom AS nom,
    a2.prenom AS prenom,
    ri.nature_relation,
    ri.impact_source_vers_cible AS impactA
  FROM relation_informelle ri
  JOIN acteur a2 ON a2.id_acteur = ri.id_acteur_cible
  WHERE ri.id_acteur_source = ?");
$stmt->execute([$id_acteur]);
$relations = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calcul radar : chaque acteur = un axe, valeur = intensité (1 à 3), nature = couleur
$radar_labels = [];
$radar_data = [];
$radar_colors = [];

foreach ($relations as $rel) {
  $nom_complet = $rel['prenom'] . ' ' . $rel['nom'];
  $radar_labels[] = $nom_complet;

  switch ($rel['impactA']) {
    case "Faible": $val = 1; break;
    case "Moyen":  $val = 2; break;
    case "Fort":   $val = 3; break;
    default:        $val = 0;
  }
  $radar_data[] = $val;

  switch ($rel['nature_relation']) {
    case "Positive": $radar_colors[] = 'rgba(0, 192, 83, 0.6)'; break;
    case "Négative": $radar_colors[] = 'rgba(254, 6, 60, 0.6)'; break;
    case "Neutre":   $radar_colors[] = 'rgba(202, 253, 15, 0.6)'; break;
    default:          $radar_colors[] = 'rgba(150, 150, 150, 0.4)';
  }
}

// Retour JSON
echo json_encode([
  "nom" => $nom_acteur,
  "radar" => [
    "labels" => $radar_labels,
    "data" => $radar_data,
    "colors" => $radar_colors
  ]
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>