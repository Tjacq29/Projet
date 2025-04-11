



let cy;
let selectedTool = null;
let tempFromNode = null;
let selectedColor = null;

document.addEventListener("DOMContentLoaded", () => {
  cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],
    layout: { name: 'breadthfirst', directed: true },
    style: [
      {
        selector: 'node',
        style: {
          'shape': 'round-rectangle', // meilleure forme visuelle qu'un simple rectangle
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
          'border-radius': '12px', // ✅ coins arrondis
          'shadow-blur': 10,       // ✅ ombre douce
          'shadow-color': '#333',
          'shadow-offset-x': 2,
          'shadow-offset-y': 2,
          'text-outline-color': '#003e7e',
          'text-outline-width': 1
        }
      }
      
      ,
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

  // Charger les acteurs + relations hiérarchiques
  Promise.all([
    fetch('../php/dashboard.php').then(res => res.json()),
    fetch('../php/get_relations_hierarchiques.php').then(res => res.json())
  ])
  .then(([acteurs, relations]) => {
    const elements = [];
    const ids = new Set();

    // Ajouter les acteurs
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

    // Ajouter les relations hiérarchiques
    console.log("Relations récup :", relations);

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
      roots: cy.nodes().filter(node => cy.edges('[target = "' + node.id() + '"]').length === 0), // noeuds sans supérieur
      animate: true,
      orientation: 'vertical' // 'vertical' met le CEO en haut
    }).run();
    
  })
  .catch(err => console.error("Erreur de chargement :", err));

  setupMenu();
});

// (le reste du code reste inchangé)

function setupMenu() {
  document.getElementById("addNodeBtn").onclick = () => {
    const id = 'n' + Date.now();
    cy.add({ group: 'nodes', data: { id, label: 'Nouvel Acteur' } });
    cy.layout({ name: 'breadthfirst' }).run();
  };

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

  document.getElementById("strokeWidthRange").oninput = (e) => {
    const val = parseInt(e.target.value);
    cy.$(':selected').forEach(el => {
      if (el.isEdge()) el.style('width', val);
    });
  };

  document.getElementById("applyAffinite").onclick = () => {
    const val = document.getElementById("affinitySelect").value;
    cy.$('edge:selected').forEach(el => el.data('label', val));
  };

  document.getElementById("applyComment").onclick = () => {
    const comment = document.getElementById("commentInput").value;
    cy.$('edge:selected').forEach(el => el.data('label', comment));
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
    } else {
      const from = tempFromNode.id();
      const to = node.id();

      const rel = {
        group: 'edges',
        data: {
          id: from + "-" + to + "-" + Date.now(),
          source: from,
          target: to,
          label: ""
        }
      };

      cy.add(rel);

      if (selectedTool === "double") {
        cy.add({ ...rel, data: { ...rel.data, id: to + "-" + from + "-" + Date.now(), source: to, target: from } });
      }

      selectedTool = null;
      tempFromNode = null;
    }
  });

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



