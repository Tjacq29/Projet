fetch('../php/get_saved_graph.php')
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      alert("Erreur de chargement des schémas.");
      return;
    }

    const tbody = document.getElementById("schemaList");

    data.schemas.forEach(schema => {
      const tr = document.createElement("tr");

      // Génération du lien image (si nom_fichier défini)
      const imagePreview = schema.nom_fichier
        ? `<img src="../schemas/img/${schema.nom_fichier}" style="max-width: 150px; display:block; margin-bottom:5px;" />`
        : "—";

      const downloadLink = schema.nom_fichier
        ? `<a href="../schemas/img/${schema.nom_fichier}" download>Télécharger</a>`
        : "—";

      const jsonLink = schema.type_schema === "informelle"
        ? "—"
        : `<a href="../schemas/${schema.nom}.json" target="_blank">Voir JSON</a>`;

      tr.innerHTML = `
        <td>${schema.prenom}</td>
        <td>${schema.nom_utilisateur}</td>
        <td>${schema.type_schema}</td>
        <td>${schema.date_time}</td>
        <td>
          ${imagePreview}
          ${downloadLink}
        </td>
        <td>${jsonLink}</td>
        <td><button onclick="deleteSchema(${schema.id_schema})">Supprimer</button></td>
      `;

      tbody.appendChild(tr);
    });
  });

function deleteSchema(id) {
  if (!confirm("Confirmer la suppression du schéma ?")) return;

  fetch('../php/delete_schema_prof.php', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id_schema: id })
  })
    .then(res => res.text()) // On traite en texte brut pour debug
    .then(text => {
      console.log("🧾 Réponse brute du serveur :", text);
      const data = JSON.parse(text);
      if (data.success) {
        alert("Schéma supprimé !");
        location.reload();
      } else {
        alert("Erreur : " + data.message);
      }
    })
    .catch(err => {
      console.error("Erreur :", err);
      alert("Erreur réseau ou JSON.");
    });
}
