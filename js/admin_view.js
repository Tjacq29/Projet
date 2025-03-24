// admin_view.js
var $ = go.GraphObject.make;
var myDiagram;

document.addEventListener("DOMContentLoaded", function () {
    fetch("../php/get_saved_graph.php")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tbody = document.getElementById("schemaList");
                tbody.innerHTML = "";

                data.schemas.forEach(schema => {
                    const fileName = schema.nom + ".png";
                    const imageUrl = "../schemas/img/" + fileName;

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${schema.nom_utilisateur}</td>
                        <td>${schema.prenom}</td>
                        <td>${schema.type_schema}</td>
                        <td>${schema.date_time}</td>
                        <td><a href="${imageUrl}" download>Télécharger</a></td>
                        <td><a href="${imageUrl}" target="_blank">Voir</a></td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement des graphiques :", error);
            alert("Erreur de connexion au serveur.");
        });
});