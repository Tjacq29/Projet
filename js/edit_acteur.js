document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idActeur = urlParams.get("id");

    if (idActeur) {
        fetch(`../php/get_acteur.php?id_acteur=${idActeur}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("Acteur non trouvé");
                    window.location.href = "dashboard.html";
                } else {
                    document.getElementById("id_acteur").value = data.id_acteur;
                    document.getElementById("nom").value = data.nom;
                    document.getElementById("prenom").value = data.prenom;
                    document.getElementById("age").value = data.age;
                    document.getElementById("role_entreprise").value = data.role_entreprise;
                    document.getElementById("secteur").value = data.secteur;

                    // 🔹 Vérifie si id_superieur existe et l'affiche, sinon met une chaîne vide
                    document.getElementById("id_superieur").value = data.id_acteur_superieur ? data.id_acteur_superieur : "";
                }
            })
            .catch(error => console.error("Erreur lors du chargement :", error));
    }

    document.getElementById("edit-acteur-form").addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(this);

        fetch("../php/edit_acteur.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) window.location.href = "dashboard.html";
        })
        .catch(error => console.error("Erreur AJAX :", error));
    });
});
