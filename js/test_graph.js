
let cy;
let selectedTool = null;
let tempFromNode = null;
let selectedColor = null;

// Formulaire contextuel HTML injecté dynamiquement
const popupFormHTML = `
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

    <label>Impact Cible → Source :</label>
    <select id="popupImpactCibleSrc" style="width:100%">
      <option value="Faible">Faible</option>
      <option value="Moyen" selected>Moyen</option>
      <option value="Fort">Fort</option>
    </select><br><br>

    <label>Nature :</label>
    <select id="popupNature" style="width:100%">
      <option value="Positive">Positive</option>
      <option value="Négative">Négative</option>
      <option value="Neutre" selected>Neutre</option>
    </select><br><br>

    <label>Durée (mois) :</label>
    <input type="number" id="popupDuree" min="0" value="0" style="width:100%"><br><br>

    <button onclick="submitRelationDetails()">✅ Valider</button>
    <button onclick="cancelRelation()">❌ Annuler</button>
  </div>
`;

let tempEdgeData = null;
let lastFrom = null;
let lastTo = null;

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

  document.body.insertAdjacentHTML("beforeend", popupFormHTML);
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
  const impactCibleSrc = document.getElementById("popupImpactCibleSrc").value;
  const nature = document.getElementById("popupNature").value;
  const duree = parseInt(document.getElementById("popupDuree").value) || 0;

  const color = getColorByNature(nature);
  const styleSrc = getLineStyleByImpact(impactSrcCible);
  const styleCible = getLineStyleByImpact(impactCibleSrc);

  const edgeData = {
    ...tempEdgeData,
    label,
    direction: tempEdgeData.direction,
    impact_source_vers_cible: impactSrcCible,
    impact_cible_vers_source: impactCibleSrc,
    nature_relation: nature,
    duree_relation: duree
  };

  const edge = cy.add({ group: 'edges', data: edgeData });
  edge.style({
    'line-color': color,
    'target-arrow-color': color,
    'width': styleSrc.width,
    'line-style': styleSrc.style
  });

  if (tempEdgeData.direction === "Double") {
    const reverseData = {
      ...edgeData,
      id: edgeData.target + "-" + edgeData.source + "-" + Date.now(),
      source: edgeData.target,
      target: edgeData.source
    };

    const reverseEdge = cy.add({ group: 'edges', data: reverseData });
    reverseEdge.style({
      'line-color': color,
      'target-arrow-color': color,
      'width': styleCible.width,
      'line-style': styleCible.style
    });
  }

  

  cancelRelation(); // Ferme le popup
}



document.addEventListener("DOMContentLoaded", () => {
  cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],
    layout: { name: 'breadthfirst', directed: true },
    style: [
      {
        selector: 'node',
        style: {
          'shape': 'round-rectangle',
          'background-color': '#0074D9',
          'label': 'data(label)',
          'color': 'white',
          'text-valign': 'center',
          'text-halign': 'center',
          'padding': '10px',
          'border-color': '#003e7',
          'border-width': 2,
          'font-size': '13px',
          'text-wrap': 'wrap',
          'text-max-width': '160px',
          'width': '150px',
          'height': '50px',
          'border-radius': '12px',
          'shadow-blur': 10,
          'shadow-color': '#333',
          'shadow-offset-x': 2,
          'shadow-offset-y': 2,
          'text-outline-color': '#003e7e',
          'text-outline-width': 1
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
      }
    ]
  });

  Promise.all([
    fetch('../php/dashboard.php').then(res => res.json()),
    fetch('../php/get_relations_hierarchiques.php').then(res => res.json())
  ])
  .then(([acteurs, relations]) => {
    const elements = [];
    const ids = new Set();

    acteurs.forEach(a => {
      const nodeId = 'act_' + a.id_acteur;
      ids.add(nodeId);
      elements.push({
        data: {
          id: nodeId,
          label: a.prenom + ' ' + a.nom
        }
      });
    });

    relations.forEach(r => {
      const fromId = r.from;
      const toId = r.to;
      elements.push({
        data: {
          id: `link_${toId}_${fromId}_${Date.now()}`,
          source: toId,
          target: fromId,
          label: r.type || ""
        },
        classes: 'hierarchie'
      });
    });

    cy.add(elements);
    cy.layout({
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 1.4,
      roots: cy.nodes().filter(node => cy.edges('[target = "' + node.id() + '"]').length === 0),
      animate: true,
      orientation: 'vertical'
    }).run();
  })
  .catch(err => console.error("Erreur de chargement :", err));

  setupMenu();
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
    cy.$(':selected').remove();
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
      body: JSON.stringify(relationsToSave)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.success
        ? ` ${data.relations_inserted} relation(s) enregistrée(s).`
        : ` Erreur : ${data.error || 'inconnue'}`);
    })
    .catch(err => {
      console.error("Erreur serveur :", err);
      alert(" Problème de communication avec le serveur.");
    });
  };

  setupColorPanel();
}

function setupColorPanel() {
  const colors = ["#58B19F", "#f8c291", "#82ccdd", "#f6b93b", "#F97F51", "#a29bfe", "#ff7675", "#00b894"];
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
