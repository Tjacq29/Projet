// fiche_acteur.js

document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("selectActeur");
    const container = document.getElementById("ficheContainer");
    const nomTitre = document.getElementById("acteurNom");
    let radarChartInstance = null;
  
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
  
          // Radar chart
          afficherRadar(acteur.radar);
  
          // Charger les détails relationnels
          fetch(`../php/fiche_relation_details.php?id_acteur=${idActeur}`)
            .then(res => res.json())
            .then(data => afficherRelations(data));
        });
    });
  
    function afficherRadar(radar) {
      const ctx = document.getElementById("radarChart").getContext("2d");
    
      if (radarChartInstance) {
        radarChartInstance.destroy();
      }
    
      // Dataset principal (la zone de fond complète)
      const mainDataset = {
        label: 'Zone de relations',
        data: radar.data,
        backgroundColor: 'rgba(100, 100, 100, 0.1)', // léger fond neutre
        borderColor: 'rgba(120, 120, 120, 0.2)', // bordure grise discrète
        borderWidth: 1,
        pointRadius: 0,
        fill: true
      };
    
      // Datasets individuels pour les couleurs personnalisées par axe
      const colorDatasets = radar.labels.map((label, i) => {
        const data = radar.labels.map((_, j) => j === i ? radar.data[i] : 0);
        return {
          label: label,
          data: data,
          backgroundColor: 'rgba(0,0,0,0)', // pas de fond
          borderColor: radar.colors[i],
          borderWidth: 2,
          pointBackgroundColor: radar.colors[i],
          pointBorderColor: radar.colors[i],
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: false
        };
      });
    
      radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: radar.labels,
          datasets: [mainDataset, ...colorDatasets]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const value = context.dataset.data[context.dataIndex];
                  return `${context.dataset.label} : ${value}`;
                }
              }
            }
          },
          scales: {
            r: {
              suggestedMin: 0,
              suggestedMax: 3,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }
    
    
    
  
    function getColor(nature) {
      switch (nature) {
        case "Positive": return "green";
        case "Négative": return "red";
        default: return "gray";
      }
    }
  
    function afficherRelations(relations) {
      const tbody = document.getElementById("tableRelations");
      tbody.innerHTML = "";
      relations.forEach(rel => {
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
  });
  