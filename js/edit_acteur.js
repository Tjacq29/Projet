document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idActeur = urlParams.get("id");

    if (idActeur) {
        fetch(`../php/get_acteur.php?id_acteur=${idActeur}`)
            .then(response => response.text()) // Changer en text() pour voir tout le texte brut
            .then(text => {
                console.log("Réponse brute du serveur :", text); // 🧪 Affiche ce que PHP renvoie vraiment
                try {
                    const data = JSON.parse(text);
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
                        const idSuperieurActuel = data.id_acteur_superieur ? data.id_acteur_superieur : "";
                        document.getElementById("id_superieur").value = idSuperieurActuel;
                    }
                } catch (e) {
                    console.error("Erreur lors du traitement JSON :", e);
                    console.log("Réponse non-JSON reçue :", text);
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
        .then(response => response.text())
        .then(text => {
            console.log("Réponse brute du serveur :", text); // Vérifie ce que PHP renvoie après le POST
            try {
                const data = JSON.parse(text);
                alert(data.message);
                if (data.success) window.location.href = "../html/dashboard.html";
            } catch (e) {
                console.error("Erreur AJAX :", e);
                console.log("Réponse non-JSON reçue :", text);
            }
        })
        .catch(error => console.error("Erreur AJAX :", error));
    });
});
