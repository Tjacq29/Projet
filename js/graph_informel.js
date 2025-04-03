// graph_informel.js – version avancée avec flèches épurées et lisibles

let myDiagram;
let showInformalLinks = true;

function init() {
  const $ = go.GraphObject.make;

  myDiagram = $(go.Diagram, "myDiagramDiv", {
    "undoManager.isEnabled": true,
    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 100,
      nodeSpacing: 50
    })
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
      layerName: "Foreground",
      relinkableFrom: false,
      relinkableTo: false,
      reshapable: true,
      curve: go.Link.Normal,
      routing: go.Link.Orthogonal,
      doubleClick: (e, obj) => deleteRelation(obj.part.data)
    },
    $(go.Shape,
      {
        strokeDashArray: [2, 4],
        strokeCap: "round"
      },
      new go.Binding("stroke", "nature_relation", getLinkColor),
      new go.Binding("strokeWidth", "impact_source_vers_cible", impactToWidth),
      new go.Binding("opacity", "visible", v => v === false ? 0 : 1).makeTwoWay()
    ),
    $(go.Shape,
      {
        toArrow: "OpenTriangle",
        strokeWidth: 1
      },
      new go.Binding("stroke", "nature_relation", getLinkColor),
      new go.Binding("fill", "nature_relation", getLinkColor),
      new go.Binding("opacity", "visible", v => v === false ? 0 : 1).makeTwoWay()
    ),
    $(go.TextBlock,
      { segmentOffset: new go.Point(0, -10), editable: false },
      new go.Binding("text", "type_relation"))
  );

  loadData();

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
        if (data.success) {
          formData.from = "act_" + formData.id_acteur_source;
          formData.to = "act_" + formData.id_acteur_cible;
          formData.id_relation_informelle = data.id_relation_informelle;
          formData.visible = true;
          myDiagram.model.addLinkData(formData);
        } else {
          alert("Erreur: " + data.error);
        }
      });
    });
  });

  const toggleBtn = document.createElement("button");
  toggleBtn.innerText = "Masquer relations informelles";
  toggleBtn.style.margin = "10px";
  toggleBtn.onclick = toggleInformalLinks;
  document.body.insertBefore(toggleBtn, document.getElementById("myDiagramDiv"));
}

function toggleInformalLinks() {
  showInformalLinks = !showInformalLinks;

  myDiagram.model.linkDataArray.forEach(link => {
    if (link.id_relation_informelle) {
      link.visible = showInformalLinks;
    }
  });
  myDiagram.model = go.Model.fromJson(myDiagram.model.toJson());

  const btn = document.querySelector("button");
  btn.innerText = showInformalLinks ? "Masquer relations informelles" : "Afficher relations informelles";
}

function loadData() {
  Promise.all([
    fetch('../php/dashboard.php').then(res => res.json()),
    fetch('../php/get_relations_informelles.php').then(res => res.json())
  ]).then(([acteurs, relationsInformelles]) => {
    const nodes = acteurs.map(a => ({
      key: "act_" + a.id_acteur,
      label: a.prenom + " " + a.nom,
      parent: a.id_acteur_superieur ? "act_" + a.id_acteur_superieur : undefined
    }));

    const linksHierarchiques = acteurs
      .filter(a => a.id_acteur_superieur)
      .map(a => ({
        from: "act_" + a.id_acteur_superieur,
        to: "act_" + a.id_acteur
      }));

    myDiagram.model = new go.GraphLinksModel(nodes, linksHierarchiques);

    relationsInformelles.forEach(r => {
      myDiagram.model.addLinkData({
        from: "act_" + r.id_acteur_source,
        to: "act_" + r.id_acteur_cible,
        type_relation: r.type_relation,
        nature_relation: r.nature_relation,
        impact_source_vers_cible: r.impact_source_vers_cible,
        id_relation_informelle: r.id_relation_informelle,
        visible: true
      });
    });
  });
}

function deleteRelation(linkData) {
  const confirmDelete = confirm("Supprimer cette relation informelle ?");
  if (!confirmDelete) return;

  fetch('../php/delete_relation_informelle.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_relation_informelle: linkData.id_relation_informelle })
  })
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      alert("Relation supprimée !");
      myDiagram.model.removeLinkData(linkData);
    } else {
      alert("Erreur: " + result.error);
    }
  })
  .catch(err => {
    console.error("Erreur fetch:", err);
    alert("Erreur réseau lors de la suppression.");
  });
}

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
      <label>Durée (mois): <input type="number" name="duree_relation" value="6"></label><br>
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

function getLinkColor(nature) {
  switch (nature) {
    case "Positive": return "green";
    case "Négative": return "red";
    case "Neutre": return "gray";
    default: return "black";
  }
}

function impactToWidth(impact) {
  switch (impact) {
    case "Faible": return 1;
    case "Moyen": return 3;
    case "Fort": return 5;
    default: return 2;
  }
}

function getDashStyle(type) {
  if (type.toLowerCase().includes("rivalité")) return [4, 4];
  if (type.toLowerCase().includes("influence")) return [10, 4];
  return null;
}

window.addEventListener("DOMContentLoaded", init);
