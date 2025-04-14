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
      tr.innerHTML = `
        <td>${schema.prenom}</td>
        <td>${schema.nom_utilisateur}</td>
        <td>${schema.type_schema}</td>
        <td>${schema.date_time}</td>
        <td><a href="../schemas/img/${schema.nom}.png" download>Télécharger</a></td>
        <td><a href="../schemas/${schema.nom}.json" target="_blank">Voir JSON</a></td>
        <td><button onclick="deleteSchema(${schema.id_schema})"> Supprimer </button></td>
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
        .then(res => res.text()) //  transforme en .text() pour voir brut
        .then(text => {
          console.log("🧾 Réponse brute du serveur :", text);
          const data = JSON.parse(text); //  on parse manuellement après
          if (data.success) {
            alert("Schéma supprimé !");
            location.reload();
          } else {
            alert("Erreur : " + data.message);
          }
        })
        .catch(err => {
          console.error(" Erreur :", err);
          alert("Erreur réseau ou JSON.");
        });
    }      
  