<?php
// fiche_relation_details.php
header('Content-Type: application/json');
require_once('../php/config.php');
session_start();

$id_acteur = isset($_GET['id_acteur']) ? intval($_GET['id_acteur']) : 0;
if ($id_acteur === 0 || !isset($_SESSION['id_utilisateur'])) {
  echo json_encode([]);
  exit;
}

$id_utilisateur = $_SESSION['id_utilisateur'];

// Vérification que l'acteur appartient bien à l'utilisateur connecté
$stmt = $pdo->prepare("SELECT id_acteur FROM acteur WHERE id_acteur = ? AND id_utilisateur = ?");
$stmt->execute([$id_acteur, $id_utilisateur]);
if (!$stmt->fetch()) {
  echo json_encode([]);
  exit;
}

// Relations informelles
$stmt = $pdo->prepare("SELECT 
    a2.nom AS nom,
    a2.prenom AS prenom,
    ri.type_relation,
    ri.nature_relation,
    ri.impact_source_vers_cible AS impactA,
    ri.impact_cible_vers_source AS impactB,
    ri.duree_relation
  FROM relation_informelle ri
  JOIN acteur a2 ON a2.id_acteur = ri.id_acteur_cible
  WHERE ri.id_acteur_source = ?");
$stmt->execute([$id_acteur]);
$relations = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Relations hiérarchiques
$stmt = $pdo->prepare("SELECT 
    a2.nom AS nom,
    a2.prenom AS prenom,
    rh.type_relation,
    'Neutre' AS nature_relation,
    'Moyen' AS impactA,
    'Faible' AS impactB,
    NULL AS duree_relation
  FROM relation_hierarchique rh
  JOIN acteur a2 ON a2.id_acteur = rh.id_acteur_superieur
  WHERE rh.id_acteur_source = ?");
$stmt->execute([$id_acteur]);
$hierarchies = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fusionner et renommer les noms
$all_relations = array_merge(
  array_map(function($r) {
    $r['nom_cible'] = $r['prenom'] . ' ' . $r['nom'];
    return $r;
  }, $relations),
  array_map(function($r) {
    $r['nom_superieur'] = $r['prenom'] . ' ' . $r['nom'];
    return $r;
  }, $hierarchies)
);

echo json_encode($all_relations, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
