
let cy;
let selectedTool = null;
let tempFromNode = null;
let selectedColor = null;
let deletedRelationIds = [];




let tempEdgeData = null;
let lastFrom = null;
let lastTo = null;

function getPopupFormHTML(direction) {
  const isDouble = direction === "Double";

  return `
    <div id="relationForm" style="
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border: 2px solid #0074D9;
      box-shadow: 0 0 15px rgba(0,0,0,0.3);
      z-index: 9999;
    ">
      <h4>Détails de la relation</h4>
      <label>Type :</label>
      <input type="text" id="popupType" placeholder="ex: Influence, Amitié..." style="width:100%"><br><br>

      <label>Impact Source → Cible :</label>
      <select id="popupImpactSrcCible" style="width:100%">
        <option value="Faible">Faible</option>
        <option value="Moyen" selected>Moyen</option>
        <option value="Fort">Fort</option>
      </select><br><br>

      ${isDouble ? `
      <label>Impact Cible → Source :</label>
      <select id="popupImpactCibleSrc" style="width:100%">
        <option value="Faible">Faible</option>
        <option value="Moyen" selected>Moyen</option>
        <option value="Fort">Fort</option>
      </select><br><br>` : ''}

      <label>Nature :</label>
      <select id="popupNature" style="width:100%">
        <option value="Positive">Positive</option>
        <option value="Négative">Négative</option>
        <option value="Neutre" selected>Neutre</option>
      </select><br><br>

      <label>Durée (mois) :</label>
      <input type="number" id="popupDuree" min="0" value="0" style="width:100%"><br><br>

      <button onclick="submitRelationDetails()">Valider</button>
      <button onclick="cancelRelation()">Annuler</button>
    </div>
  `;
}


function createRelationPopup(fromId, toId, direction) {
  if (document.getElementById("relationForm")) return;

  lastFrom = fromId;
  lastTo = toId;

  tempEdgeData = {
    id: fromId + "-" + toId + "-" + Date.now(),
    source: fromId,
    target: toId,
    direction
  };

  document.body.insertAdjacentHTML("beforeend", getPopupFormHTML(direction));
}

function cancelRelation() {
  const form = document.getElementById("relationForm");
  if (form) form.remove();
  tempEdgeData = null;
}

function getColorByNature(nature) {
  switch (nature) {
    case 'Positive': return '#2ecc71'; // vert
    case 'Négative': return '#e74c3c'; // rouge
    case 'Neutre': return '#95a5a6'; // gris
    default: return '#999';
  }
}

function getLineStyleByImpact(impact) {
  switch (impact) {
    case 'Faible': return { width: 2, style: 'dotted' };
    case 'Moyen': return { width: 5, style: 'solid' };
    case 'Fort': return { width: 8, style: 'solid' };
    default: return { width: 2, style: 'solid' };
  }
}

function submitRelationDetails() {
  const label = document.getElementById("popupType").value || "Relation";
  const impactSrcCible = document.getElementById("popupImpactSrcCible").value;
  const impactCibleSrc = document.getElementById("popupImpactCibleSrc")
    ? document.getElementById("popupImpactCibleSrc").value
    : null;

  const nature = document.getElementById("popupNature").value;
  const duree = parseInt(document.getElementById("popupDuree").value) || 0;

  const color = getColorByNature(nature);
  const styleSrc = getLineStyleByImpact(impactSrcCible);
  const styleCible = getLineStyleByImpact(impactCibleSrc);

  const uid = Date.now(); // uid temporaire côté client (sera ignoré si non utilisé)

  const edgeData = {
    ...tempEdgeData,
    label,
    direction: tempEdgeData.direction,
    impact_source_vers_cible: impactSrcCible,
    impact_cible_vers_source: impactCibleSrc,
    nature_relation: nature,
    duree_relation: duree,
    uid: uid
  };

  // Flèche principale
  const edge = cy.add({ group: 'edges', data: edgeData });
  edge.style({
    'line-color': color,
    'target-arrow-color': color,
    'width': styleSrc.width,
    'line-style': styleSrc.style
  });

  // Si double, ajouter la flèche miroir (sans uid pour éviter double suppression)
  if (tempEdgeData.direction === "Double") {
    const reverseEdge = cy.add({
      group: 'edges',
      data: {
        ...edgeData,
        id: edgeData.target + "-" + edgeData.source + "-" + Date.now(),
        source: edgeData.target,
        target: edgeData.source
      }
    });

    reverseEdge.style({
      'line-color': color,
      'target-arrow-color': color,
      'width': styleCible.width,
      'line-style': styleCible.style
    });
  }

  cancelRelation(); // Ferme le formulaire
}

document.addEventListener("DOMContentLoaded", () => {
  cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: true,
    elements: [],
    layout: { name: 'breadthfirst', directed: true },
    style: [
      {
        selector: 'node',
        style: {
          'shape': 'round-rectangle',
          'background-color': '#d6d8db',
          'label': 'data(label)',
          'color': '#222',
          'text-valign': 'center',
          'text-halign': 'center',
          'border-color': '#999',
          'border-width': 2,
          'font-size': '16px',
          'text-wrap': 'wrap',
          'text-max-width': '160px',
          'width': '160px',
          'height': '60px',
          'text-outline-color': '#fff',
          'text-outline-width': 0.5
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'line-color': '#999',
          'target-arrow-color': '#999',
          'width': 2,
          'label': 'data(label)',
          'font-size': '10px'
        }
      },
      {
        selector: '.hierarchie',
        style: {
          'line-color': '#666',
          'target-arrow-color': '#666',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'width': 2,
          'line-style': 'solid'
        }
      },
      {
        selector: '.zoneContour',
        style: {
          'background-opacity': 0,
          'border-width': 3,
          'border-style': 'dashed',
          'border-color': '#2ecc71',
          'label': 'data(label)',
          'text-valign': 'top',
          'text-halign': 'center',
          'font-size': 14,
          'color': '#444'
        }
      }
    ]
  });

  Promise.all([
    fetch('../php/dashboard.php').then(res => res.json()),
    fetch('../php/get_relations_hierarchiques.php').then(res => res.json()),
    fetch('../php/get_relations_informelles.php').then(res => res.json())
  ])
  
  .then(([acteurs, relationsHierarchiques, relationsInformelles]) => {
    const hierarchyElements = [];
    const informelleElements = [];

    // Ajout des acteurs (noeuds)
    acteurs.forEach(a => {
      const nodeId = 'act_' + a.id_acteur;
      hierarchyElements.push({
        data: {
          id: nodeId,
          label: a.prenom + ' ' + a.nom
        }
      });
    });
    console.log("relationsHierarchiques =", relationsHierarchiques);

    // Relations hiérarchiques
    relationsHierarchiques.forEach(r => {
      hierarchyElements.push({
        data: {
          id: `link_${r.to}_${r.from}_${Date.now()}`,
          source: r.to,
          target: r.from,
          label: r.type || ""
        },
        classes: 'hierarchie'
      });
    });

    // ➕ Ajoute la hiérarchie uniquement
    cy.add(hierarchyElements);

    // ➕ Applique le layout hiérarchique uniquement sur les relations hiérarchiques
    cy.layout({
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 1.4,
      roots: cy.nodes().filter(node =>
        cy.edges('[target = "' + node.id() + '"]').length === 0
      ),
      animate: true,
      orientation: 'vertical'
    }).run();

    // Relations informelles ensuite (sans relayout)
    if (Array.isArray(relationsInformelles)) {
      relationsInformelles.forEach(rel => {
        const color = getColorByNature(rel.nature_relation);
        const styleSrc = getLineStyleByImpact(rel.impact_source_vers_cible);
        const styleCible = getLineStyleByImpact(rel.impact_cible_vers_source);

        informelleElements.push({
          data: {
            id: "rel_" + rel.uid,
            uid: rel.uid,
            source: rel.from,
            target: rel.to,
            label: rel.type_relation,
            direction: rel.direction,
            impact_source_vers_cible: rel.impact_source_vers_cible,
            impact_cible_vers_source: rel.impact_cible_vers_source,
            nature_relation: rel.nature_relation,
            duree_relation: rel.duree_relation
          },
          style: {
            'line-color': color,
            'target-arrow-color': color,
            'width': styleSrc.width,
            'line-style': styleSrc.style
          }
        });

        if (rel.direction === "Double") {
          informelleElements.push({
            data: {
              id: "rel_" + rel.uid + "_reverse",
              uid: rel.uid,
              source: rel.to,
              target: rel.from,
              label: rel.type_relation,
              direction: rel.direction,
              impact_source_vers_cible: rel.impact_cible_vers_source,
              impact_cible_vers_source: rel.impact_source_vers_cible,
              nature_relation: rel.nature_relation,
              duree_relation: rel.duree_relation
            },
            style: {
              'line-color': color,
              'target-arrow-color': color,
              'width': styleCible.width,
              'line-style': styleCible.style
            }
          });
        }
      });

      cy.add(informelleElements); // Ajout sans relancer le layout
    }

    setupMenu();
  })
  .catch(err => console.error("Erreur de chargement :", err));
});




function setupMenu() {
  document.getElementById("linkSimpleBtn").onclick = () => {
    selectedTool = "simple";
    tempFromNode = null;
  };

  document.getElementById("linkDoubleBtn").onclick = () => {
    selectedTool = "double";
    tempFromNode = null;
  };

  document.getElementById("deleteSelectedBtn").onclick = () => {
    if (confirm(
      "Voulez-vous supprimer cette relation ?\n\n" +
      "Si vous supprimez une flèche d'une relation double, toute la relation sera supprimée."
    )) {
    
      const selected = cy.$(':selected');
  
      selected.forEach(el => {
        if (el.isEdge() && !el.hasClass("hierarchie")) {
          const uid = el.data("uid");
  
          // 🔒 Vérifie si cette relation a déjà été marquée pour suppression
          if (uid && !deletedRelationIds.includes(uid)) {
            deletedRelationIds.push(uid);
  
            // 🧠 Si c'est une relation double (flèche aller + retour),
            // alors on doit supprimer aussi la flèche inverse visuelle
            const direction = el.data("direction");
            if (direction === "Double") {
              const reverse = cy.edges().filter(e =>
                e.data("uid") === uid &&
                e.id() !== el.id() // on ne supprime pas deux fois le même edge
              );
              reverse.remove(); // ❌ supprime la flèche visuelle miroir
            }
          }
        }
      });
  
      // ❌ Enfin, supprime la flèche sélectionnée
      selected.remove();
    }
  };
  

  
  

  cy.on('tap', 'node', (e) => {
    const node = e.target;
    if (selectedColor) {
      node.style('background-color', selectedColor);
      selectedColor = null;
      return;
    }
    if (!selectedTool) return;
    if (!tempFromNode) {
      tempFromNode = node;
    } 
    else if (selectedTool== "Simple"){
        
    }
    else {
      const from = tempFromNode.id();
      const to = node.id();
      const direction = selectedTool === "double" ? "Double" : "Simple";
      createRelationPopup(from, to, direction); // Montre le formulaire pop-up
      tempFromNode = null;
      selectedTool = null;
    }
  });

  document.getElementById("saveGraphBtn").onclick = () => {
    const relationsToSave = [];
    cy.edges().forEach(edge => {
      if (!edge.hasClass("hierarchie")) {
        const sourceId = edge.source().id().replace("act_", "");
        const targetId = edge.target().id().replace("act_", "");
        relationsToSave.push({
          source: sourceId,
          target: targetId,
          type_relation: edge.data("label") || "Non précisée",
          direction: edge.data("direction") || "Simple",
          impact_source_vers_cible: edge.data("impact_source_vers_cible") || "Moyen",
          impact_cible_vers_source: edge.data("impact_cible_vers_source") || "Moyen",
          nature_relation: edge.data("nature_relation") || "Neutre",
          duree_relation: edge.data("duree_relation") || 0
        });
      }
    });
  
    fetch("../php/save_relation_informelle.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        relations: relationsToSave,
        toDelete: deletedRelationIds
      })
    })
    .then(res => res.text()) // récupère en texte brut
    .then(text => {
      console.log("Réponse brute du serveur :", text); // 🔍 tu verras l'erreur ici

      const response = JSON.parse(text); // tu le parses à la main
      alert(response.success
        ? ` ${response.relations_inserted} relation(s) enregistrée(s).`
        : ` Erreur : ${response.error || 'inconnue'}`);

  deletedRelationIds = [];
})

    
    .catch(err => {
      console.error("Erreur serveur :", err);
      alert(" Problème de communication avec le serveur.");
    });
  };
  

  setupColorPanel();
  // ➕ EMOJI SUR RELATION
  

}

function setupColorPanel() {
  const colors = ["#58B19F", "#f8c291", "#82ccdd", "#f6b93b", "#F97F51", "#a29bfe", "#ff7675"];
  const panel = document.getElementById("colorPanel");
  colors.forEach(color => {
    const btn = document.createElement("button");
    btn.className = "color-choice";
    btn.style.backgroundColor = color;
    btn.title = color;
    btn.onclick = () => {
      selectedColor = color;
    };
    panel.appendChild(btn);
  });
}

function creerZoneContour(type = "alliance") {
  const selectedNodes = cy.nodes(":selected");

  if (selectedNodes.length < 2) {
    alert("Sélectionne au moins deux acteurs pour créer une zone.");
    return;
  }

  const idZone = "zone_" + Date.now();
  const couleur = type === "tension" ? "#e74c3c" : "#2ecc71";
  const etiquette = type === "tension" ? " TENSION - - -" : " ALLIANCE + + +";

  // Ajouter le compound node
  cy.add({
    group: 'nodes',
    data: { id: idZone, label: etiquette },
    classes: 'zoneContour',
    position: { x: 0, y: 0 } // inutile, auto-géré
  });

  // Définir comme parent des noeuds sélectionnés
  selectedNodes.forEach(node => {
    node.move({ parent: idZone });
  });

  // Appliquer la couleur de bordure
  cy.$id(idZone).style({ 'border-color': couleur });
}


document.getElementById("submitToProfBtn").onclick = () => {
  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    alert("Vous devez être connecté.");
    return;
  }

  const imageData = cy.png({ scale: 2, output: 'blob' }); // export Cytoscape en image
  const formData = new FormData();
  formData.append("image", imageData, "graph_informel.png");
  formData.append("id_utilisateur", userId);
  formData.append("type_schema", "informelle");
  formData.append("nom", "graphe_informel_" + Date.now());

  fetch("../php/save_graph_with_image.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Graphe informel envoyé au professeur !");
      const role = sessionStorage.getItem("role");
      if (role === "prof") window.location.href = "../html/admin_view.html";
    } else {
      alert("Erreur : " + data.message);
    }
  })
  .catch(err => {
    console.error("Erreur :", err);
    alert("Erreur lors de l’envoi du graphe.");
  });
};



function supprimerZoneContour() {
  const selected = cy.nodes(":selected");
  const zone = selected.filter(n => n.hasClass("zoneContour"));

  if (zone.length === 0) {
    alert("Sélectionne une zone (bordure) à supprimer.");
    return;
  }

  const zoneId = zone[0].id();

  // Détacher les enfants
  cy.nodes(`[parent = "${zoneId}"]`).move({ parent: null });

  // Supprimer la zone
  zone.remove();
}
