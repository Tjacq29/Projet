// fiche_acteur.js

document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("selectActeur");
    const container = document.getElementById("ficheContainer");
    const nomTitre = document.getElementById("acteurNom");
  
    if (!select || !container || !nomTitre) {
      console.error("Élément manquant dans le HTML (selectActeur, ficheContainer ou acteurNom)");
      return;
    }
  
    // Charger la liste des acteurs au chargement
    fetch('../php/get_acteurs_utilisateur.php')
      .then(res => res.json())
      .then(data => {
        data.forEach(acteur => {
          const opt = document.createElement("option");
          opt.value = acteur.id_acteur;
          opt.textContent = `${acteur.prenom} ${acteur.nom}`;
          select.appendChild(opt);
        });
      });
  
    // Quand on choisit un acteur
    select.addEventListener("change", () => {
      const idActeur = select.value;
      if (!idActeur) return;
  
      fetch(`../php/fiche_acteur.php?id_acteur=${idActeur}`)
        .then(res => res.json())
        .then(acteur => {
          container.style.display = "block";
          nomTitre.textContent = acteur.nom;
          afficherRelations(acteur);
          dessinerGraphiqueRelations(acteur);
          dessinerGraphiqueBarres(acteur);
        });
    });
  
    function getColor(nature) {
      switch (nature) {
        case "Positive": return "green";
        case "Négative": return "red";
        default: return "gray";
      }
    }
  
    function getSymbol(nature, impact) {
      const levels = { Faible: 1, Moyen: 2, Fort: 3 };
      const intensity = levels[impact] || 0;
      if (nature === "Positive") return "+".repeat(intensity);
      if (nature === "Négative") return "-".repeat(intensity);
      return "0";
    }
  
    function afficherRelations(acteur) {
      const tbody = document.getElementById("tableRelations");
      tbody.innerHTML = "";
      acteur.relations.forEach(rel => {
        const row = `<tr>
            <td>${rel.nom_cible ? rel.nom_cible : (rel.nom_superieur ? rel.nom_superieur : 'Inconnu')}</td>
            <td>${rel.type_relation}</td>
            <td style="color:${getColor(rel.nature_relation)};">${rel.nature_relation ? rel.nature_relation : 'Neutre'}</td>
            <td>${rel.impactA}</td>
            <td>${rel.impactB}</td>
            <td>${rel.duree_relation ? rel.duree_relation : '-'}</td>
        </tr>`;

        tbody.insertAdjacentHTML("beforeend", row);
      });
    }
  
    function dessinerGraphiqueRelations(acteur) {
      const canvas = document.getElementById("relationCanvas");
      const ctx = canvas.getContext("2d");
      const center = { x: canvas.width / 2, y: canvas.height / 2 };
      const radius = 180;
      const actorRadius = 20;
      const total = acteur.relations.length;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Acteur central
      ctx.beginPath();
      ctx.arc(center.x, center.y, actorRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#007bff";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText("Moi", center.x, center.y + 5);
  
      // Relations
      acteur.relations.forEach((rel, i) => {
        const angle = (2 * Math.PI / total) * i;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
  
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = getColor(rel.nature_relation);
        ctx.lineWidth = 2;
        ctx.stroke();
  
        const midX = (center.x + x) / 2;
        const midY = (center.y + y) / 2;
        ctx.fillStyle = "#000";
        ctx.fillText(getSymbol(rel.nature_relation, rel.impactA), midX, midY);
  
        ctx.beginPath();
        ctx.arc(x, y, actorRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ccc";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.fillText(rel.nom_cible || rel.nom_superieur, x, y + 30);
      });
    }
  
    function dessinerGraphiqueBarres(acteur) {
      new Chart(document.getElementById("barChart"), {
        type: 'bar',
        data: {
          labels: ["Informelles", "Hiérarchiques", "Positives", "Négatives", "Fortes"],
          datasets: [{
            label: "Nombre",
            data: [
              acteur.stats.informelles,
              acteur.stats.hierarchiques,
              acteur.stats.positives,
              acteur.stats.negatives,
              acteur.stats.fortes
            ],
            backgroundColor: "rgba(54, 162, 235, 0.6)"
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: { beginAtZero: true }
          }
        }
      });
    }
  });
  