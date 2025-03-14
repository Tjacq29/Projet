document.addEventListener("DOMContentLoaded", function () {
    loadActeurs(); // on appelle cette fonction directe au chargement de la page pour récup la liste des acteurs et remplir le tableau

    document.getElementById("create-acteur-form")?.addEventListener("submit", function (event) { // utlisateur clique sur le bouton submit
        event.preventDefault();
        const formData = new FormData(this);

        fetch("../php/create_acteur.php", {// requete ajax envoi les données a create_php sans recharger la page
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) window.location.href = "../html/dashboard.html";
        })
        .catch(error => console.error("Erreur AJAX :", error));
    });
});

function loadActeurs() {
    fetch("../php/dashboard.php")
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector("#table-acteurs tbody");
        tbody.innerHTML = "";
        data.forEach(acteur => {
            tbody.innerHTML += `
                <tr>
                    <td>${acteur.id_acteur}</td>
                    <td>${acteur.nom}</td>
                    <td>${acteur.prenom}</td>
                    <td>${acteur.age}</td>
                    <td>${acteur.role_entreprise}</td>
                    <td>${acteur.secteur}</td>
                    <td>${acteur.id_acteur_superieur !== null ? acteur.id_acteur_superieur : "CEO"}</td>
                    <td>
                        <a class='btn btn-primary btn-sm' href='edit_acteur.html?id=${acteur.id_acteur}'>Modifier</a>
                        <button class='btn btn-danger btn-sm' onclick='removeActeur(${acteur.id_acteur})'>Supprimer</button>
                    </td>
                </tr>`;
        });
    })
    .catch(error => console.error("Erreur lors du chargement :", error));
}

function removeActeur(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet acteur ?")) {
        fetch(`../php/remove_acteur.php?id_acteur=${id}`) // l'utilisateur envoi l'ID acteur a remove_acteur.php
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) loadActeurs();// actualiser la liste des acteurs
        })
        .catch(error => console.error("Erreur lors de la suppression :", error));
    }
}
