// graph_informel.js – version avancée avec formulaire relation

let myDiagram;

function init() {
  const $ = go.GraphObject.make;

  myDiagram = $(go.Diagram, "myDiagramDiv", {
    "undoManager.isEnabled": true,
    layout: $(go.TreeLayout, { angle: 90, layerSpacing: 80 })
  });

  myDiagram.nodeTemplate = $(go.Node, "Auto",
    $(go.Shape, "RoundedRectangle",
      {
        strokeWidth: 1.5,
        fill: "#b7d8f7",
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer"
      }),
    $(go.TextBlock,
      {
        margin: 8,
        font: "bold 14px sans-serif",
        editable: false
      },
      new go.Binding("text", "label"))
  );

  myDiagram.linkTemplate = $(go.Link,
    {
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      curve: go.Link.Bezier,
      routing: go.Link.AvoidsNodes,
      doubleClick: (e, obj) => deleteRelation(obj.part.data)
    },
    $(go.Shape, { strokeWidth: 2 }),
    $(go.Shape, { toArrow: "Standard" }),
    $(go.TextBlock,
      { segmentOffset: new go.Point(0, -10), editable: true },
      new go.Binding("text", "label"))
  );

  Promise.all([
    fetch('../php/get_acteurs_utilisateur.php').then(res => res.json()),
    fetch('../php/get_relations_hierarchiques.php').then(res => res.json())
  ]).then(([acteurs, relations]) => {
    const nodes = acteurs.map(a => ({
      key: "act_" + a.id_acteur,
      label: a.prenom + " " + a.nom
    }));

    const links = relations.map(r => ({
      from: r.from,
      to: r.to,
      label: r.type || "hiérarchie"
    }));

    myDiagram.model = new go.GraphLinksModel(nodes, links);
  });

  // ➕ Créer une relation informelle avec formulaire
  myDiagram.addDiagramListener("LinkDrawn", (e) => {
    const link = e.subject;
    const fromId = parseInt(link.data.from.replace("act_", ""));
    const toId = parseInt(link.data.to.replace("act_", ""));

    openRelationForm(fromId, toId, (formData) => {
      fetch('../php/save_relation_informelle.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) alert("Erreur : " + data.error);
          else {
            link.data.label = formData.type_relation;
            myDiagram.model.updateTargetBindings(link.data);
          }
        });
    });
  });
}

// 🗑 Suppression de relation
function deleteRelation(linkData) {
  const confirmDelete = confirm("Supprimer cette relation informelle ?");
  if (!confirmDelete) return;

  // Optionnel : fetch vers PHP pour supprimer en BDD si relation_informelle existe déjà
  myDiagram.model.removeLinkData(linkData);
}

// 📋 Afficher un formulaire personnalisé (popup simplifié)
function openRelationForm(sourceId, cibleId, callback) {
  const form = document.createElement("form");
  form.innerHTML = `
    <div style="position:fixed;top:30%;left:30%;background:#fff;padding:20px;border:1px solid #ccc;z-index:1000">
      <h3>Nouvelle relation</h3>
      <label>Type: <input name="type_relation" value="Mentorat"></label><br>
      <label>Direction: <select name="direction_relation">
        <option>Simple</option><option>Double</option>
      </select></label><br>
      <label>Impact source → cible:
        <select name="impact_source_vers_cible">
          <option>Faible</option><option>Moyen</option><option>Fort</option>
        </select></label><br>
      <label>Impact cible → source:
        <select name="impact_cible_vers_source">
          <option>Faible</option><option>Moyen</option><option>Fort</option>
        </select></label><br>
      <label>Nature: <select name="nature_relation">
        <option>Positive</option><option>Négative</option><option>Neutre</option>
      </select></label><br>
      <label>Durée: <input type="number" name="duree_relation" value="6"></label><br>
      <button type="submit">Valider</button>
    </div>
  `;

  document.body.appendChild(form);

  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.id_acteur_source = sourceId;
    data.id_acteur_cible = cibleId;
    document.body.removeChild(form);
    callback(data);
  };
}

window.addEventListener("DOMContentLoaded", init);
