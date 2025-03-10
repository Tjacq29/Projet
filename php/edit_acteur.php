




<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Tableau des Acteurs</title>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js">
    
</head>
<body>
    <div class="container">
        <h2>Ajouter un Acteur</h2>
        <form method="POST" action="create_acteur.php">
            <input type="hidden" value="<?php echo $id; ?>>
            <div class="mb-3">
                <label for="nom" class="form-label">Nom</label>
                <input type="text" class="form-control" id="nom" name="nom" <?php echo $nom; ?>>    
            </div>
            <div class="mb-3">
                <label for="prenom" class="form-label">Prénom</label>
                <input type="text" class="form-control" id="prenom" name="prenom" <?php echo $prenom; ?>>
            </div>
            <div class="mb-3">
                <label for="age" class="form-label">Âge</label>
                <input type="number" class="form-control" id="age" name="age" <?php echo $age; ?>>
            </div>
            <div class="mb-3">
                <label for="role_entreprise" class="form-label">Rôle Entreprise</label>
                <input type="text" class="form-control" id="role_entreprise" name="role_entreprise" <?php echo $role_entreprise; ?>>
            </div>
            <div class="mb-3">
                <label for="secteur" class="form-label">Secteur</label>
                <input type="text" class="form-control" id="secteur" name="secteur"   <?php echo $secteur; ?>>
            </div>
            <div class="mb-3">
                <label for="id_superieur" class="form-label">ID du Supérieur</label>
                <input type="number" class="form-control" id="id_superieur" name="id_superieur" <?php echo $id_superieur; ?>>    
            </div>
            <button type="submit" class="btn btn-primary" name="submit">Ajouter</button>    
        </form>
    </div>      


</body>
</html> 
