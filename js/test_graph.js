
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
        <option value="Moyen" selected>Neutre</option>
        <option value="Fort">Fort</option>
      </select><br><br>

      ${isDouble ? `
      <label>Impact Cible → Source :</label>
      <select id="popupImpactCibleSrc" style="width:100%">
        <option value="Faible">Faible</option>
        <option value="Moyen" selected>Neutre</option>
        <option value="Fort">Fort</option>
      </select><br><br>` : ''}

      <label>Nature :</label>
      <select id="popupNature" style="width:100%">
        <option value="Positive">Positive</option>
        <option value="Négative">Négative</option>
        <option value="Neutre" selected>Neutre</option>
      </select><br><br>

      <label>Durée :</label>
      <input type="text" id="popupDuree" placeholder="ex: 12 mois ou Relation longue" style="width:100%"><br><br>


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
  const label = document.getElementById("popupType").value.trim();
  const impactSrcCible = document.getElementById("popupImpactSrcCible").value;
  const impactCibleSrc = document.getElementById("popupImpactCibleSrc")
    ? document.getElementById("popupImpactCibleSrc").value
    : null;

  const nature = document.getElementById("popupNature").value;
  const duree = document.getElementById("popupDuree").value.trim();

  const color = getColorByNature(nature);
  const styleSrc = getLineStyleByImpact(impactSrcCible);
  const styleCible = getLineStyleByImpact(impactCibleSrc);

  const uid = Date.now(); // uid temporaire côté client (sera ignoré si non utilisé)

  const edgeData = {
    ...tempEdgeData,
    label: label.length <= 15 ? label : "",
    type_relation: label,
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
        target: edgeData.source,
        label:""
      }
    });

    reverseEdge.style({
      'line-color': color,
      'target-arrow-color': color,
      'width': styleCible.width,
      'line-style': styleCible.style,
      'curve-style': 'bezier',
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

    // Ajout des act
    acteurs.forEach(a => {
      const nodeId = 'act_' + a.id_acteur;
      hierarchyElements.push({
        data: {
          id: nodeId,
          label: a.prenom + ' ' + a.nom,
          role_entreprise: a.role_entreprise || "Non défini",
          age: a.age || "Non précisé",
          secteur: a.secteur || "Non précisé",
          extraFields: a.extra_fields || []// au cas où tu veux ajouter des champs personnalisés après
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

    //  On ajoute juste la hiérarchie 
    cy.add(hierarchyElements);

    //  On applique le layout que sur les relations hiérarchiques pour éviter pbm précédent de recalcul des positions
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
            label: rel.type_relation.length <= 15 ? rel.type_relation : "",
            type_relation: rel.type_relation,
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
              label: " ",
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

    // ➡️ Ajouter les événements de survol (mouseover/mouseout) sur les flèches

cy.on('mouseover', 'edge', (event) => {
  const edge = event.target;

  if (!edge.hasClass('hierarchie')) {
    const content = `
      <strong>Type :</strong> ${edge.data('type_relation') || "Non précisé"}<br>
      <strong>Durée :</strong> ${edge.data('duree_relation') || "Non précisé"}<br>
      <strong>Nature :</strong> ${edge.data('nature_relation') || "Neutre"}<br>
    `;

    const tooltip = document.createElement('div');
    tooltip.id = 'tooltipEdge';
    tooltip.innerHTML = content;
    tooltip.style.position = 'fixed';
    tooltip.style.top = (event.originalEvent.clientY + 10) + 'px';
    tooltip.style.left = (event.originalEvent.clientX + 10) + 'px';
    tooltip.style.background = '#fff';
    tooltip.style.border = '1px solid #ccc';
    tooltip.style.padding = '8px';
    tooltip.style.boxShadow = '0px 0px 8px rgba(0,0,0,0.3)';
    tooltip.style.zIndex = 10000;
    tooltip.style.maxWidth = '250px';
    tooltip.style.fontSize = '12px';
    
    document.body.appendChild(tooltip);
  }
});

cy.on('mouseout', 'edge', (event) => {
  const tooltip = document.getElementById('tooltipEdge');
  if (tooltip) tooltip.remove();
});

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
  
          //  Vérifie si cette relation a déjà été marquée pour suppression
          if (uid && !deletedRelationIds.includes(uid)) {
            deletedRelationIds.push(uid);
  
            // Si c'est une relation double (flèche aller + retour),
            // alors on doit supprimer aussi la flèche inverse visuelle
            const direction = el.data("direction");
            if (direction === "Double") {
              const reverse = cy.edges().filter(e =>
                e.data("uid") === uid &&
                e.id() !== el.id() // on ne supprime pas deux fois le même edge
              );
              reverse.remove(); // supprime la flèche visuelle miroir
            }
          }
        }
      });
  
      // Enfin, supprime la flèche sélectionnée
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
  
    if (!selectedTool) {
      // ➡️ Aucun outil sélectionné : ouvrir la fiche acteur
      showActorPopup(node);
      return;
    }
  
    if (!tempFromNode) {
      tempFromNode = node;
    } 
    else if (selectedTool === "Simple" || selectedTool === "Double") {
      const from = tempFromNode.id();
      const to = node.id();
      const direction = selectedTool === "double" ? "Double" : "Simple";
      createRelationPopup(from, to, direction);
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
  const colors = [
    "#bdc3c7", // gris clair - acteurs discrets
    "#58B19F", // vert eau
    "#f8c291", // pêche clair
    "#82ccdd", // bleu ciel
    "#f6b93b", // jaune vif
    "#F97F51", // orange doux
    "#a29bfe", // violet pastel
    "#ff7675"  // rouge rosé
  ];
  const panel = document.getElementById("colorPanel");
  panel.innerHTML = ""; // vide le panneau
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

  // 🔥 Filtrer uniquement les acteurs normaux (PAS les zones)
  const actorsOnly = selectedNodes.filter(node => 
    !node.hasClass('zoneContour') && !node.data('isZone')
  );

  if (actorsOnly.length < 2) {
    alert("Sélectionne au moins deux acteurs pour créer une zone.");
    return;
  }

  const boundingBox = actorsOnly.boundingBox();
  const idZone = "zone_" + Date.now();
  const couleur = type === "tension" ? "#e74c3c" : "#2ecc71";
  const etiquette = type === "tension" ? "TENSION - - -" : "ALLIANCE + + +";

  cy.add({
    group: 'nodes',
    data: {
      id: idZone,
      label: etiquette,
      isZone: true
    },
    position: {
      x: (boundingBox.x1 + boundingBox.x2) / 2,
      y: (boundingBox.y1 + boundingBox.y2) / 2
    },
    selectable: true,    // ✅ on peut cliquer
    grabbable: true,     // ✅ on peut déplacer
    locked: false        // ✅ libre
  });

  cy.$id(idZone).style({
    'shape': 'roundrectangle',
    'width': boundingBox.w + 80,
    'height': boundingBox.h + 80,
    'background-opacity': 0,
    'border-width': 3,
    'border-color': couleur,
    'border-style': 'dashed',
    'label': etiquette,
    'text-valign': 'top',
    'text-halign': 'center',
    'font-size': 14,
    'color': '#444',
    'z-compound-depth': 'bottom' // 🔥 reste en arrière plan
  });
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
  const zone = selected.filter(n => n.data('isZone') === true); // 🎯 Cible uniquement les vraies zones

  if (zone.length === 0) {
    alert("Sélectionne une zone à supprimer (clic sur le bord d'une zone).");
    return;
  }

  zone.remove();




}

document.getElementById("saveActorBtn").onclick = () => {
  const nodeId = node.id().replace("act_", ""); // enlever "act_" pour avoir juste l'id

  const role = document.getElementById("actorRole").value;
  const age = document.getElementById("actorAge").value;
  const secteur = document.getElementById("actorSector").value;

  const customZone = document.getElementById("customFields");
  const extraInputs = customZone.querySelectorAll("input[data-label]");
  const extraFields = Array.from(extraInputs).map(input => ({
    label: input.dataset.label,
    value: input.value
  }));

  // Mise à jour dans cytoscape
  node.data("role_entreprise", role);
  node.data("age", age);
  node.data("secteur", secteur);
  node.data("extraFields", extraFields);

  // ➡️ ENVOI AU SERVEUR
  fetch("../php/save_actor_fields.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_acteur: nodeId,
      role_entreprise: role,
      age: age,
      secteur: secteur,
      extraFields: extraFields
    })
  })
  .then(response => response.json())
  .then(data => {
    if (!data.success) {
      alert("Erreur lors de la sauvegarde: " + data.message);
    }
  })
  .catch(error => {
    console.error("Erreur:", error);
    alert("Erreur serveur lors de la sauvegarde");
  });

  closeActorPopup();
};


function closeActorPopup() {
  document.getElementById("actorPopup").style.display = "none";
}
function showActorPopup(node) {
  const popup = document.getElementById("actorPopup");

  // Remplir les données
  document.getElementById("actorName").innerText = node.data("label") || "";
  document.getElementById("actorRole").value = node.data("role_entreprise") || "";
  document.getElementById("actorAge").value = node.data("age") || "";
  document.getElementById("actorSector").value = node.data("secteur") || "";

  const customZone = document.getElementById("customFields");
  customZone.innerHTML = "";
  (node.data("extraFields") || []).forEach(({ label, value }) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>${label}</label>
      <input type="text" data-label="${label}" value="${value}">
    `;
    customZone.appendChild(div);
  });

  // Positionner le popup
  const pos = node.renderedPosition();
  popup.style.left = (pos.x + 30) + "px";
  popup.style.top = (pos.y - 30) + "px";
  popup.style.transform = "none"; // ❗ Important
  popup.style.display = "block";

  document.getElementById("saveActorBtn").onclick = () => {
    node.data("role_entreprise", document.getElementById("actorRole").value);
    node.data("age", document.getElementById("actorAge").value);
    node.data("secteur", document.getElementById("actorSector").value);

    const extraInputs = customZone.querySelectorAll("input[data-label]");
    node.data("extraFields", Array.from(extraInputs).map(input => ({
      label: input.dataset.label,
      value: input.value
    })));

    closeActorPopup();
  };

  document.getElementById("addCustomFieldBtn").onclick = () => {
    const label = prompt("Nom du champ personnalisé :");
    if (label) {
      const div = document.createElement("div");
      div.innerHTML = `
        <label>${label}</label>
        <input type="text" data-label="${label}">
      `;
      customZone.appendChild(div);
    }
  };
}

function closeActorPopup() {
  document.getElementById("actorPopup").style.display = "none";
}

