let myDiagram;
let selectedTool = null;
let tempFromNode = null;
let selectedColor = null;

function init() {
  const $ = go.GraphObject.make;

  myDiagram = $(go.Diagram, "myDiagramDiv", {
    "undoManager.isEnabled": true,
    "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
    initialAutoScale: go.Diagram.Uniform,
    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 100,
      nodeSpacing: 50,
      arrangement: go.TreeLayout.ArrangementFixedRoots
    })
  });

  myDiagram.nodeTemplate = $(go.Node, "Auto",
    {
      selectionAdorned: true,
      resizable: true,
      resizeObjectName: "SHAPE",
      locationSpot: go.Spot.Center,
      movable: true
    },
    $(go.Shape, "RoundedRectangle",
      {
        name: "SHAPE",
        fill: "#b7d8f7",
        strokeWidth: 1.5,
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer"
      },
      new go.Binding("fill", "fill").makeTwoWay()
    ),
    $(go.TextBlock,
      {
        margin: 8,
        font: "bold 14px sans-serif",
        editable: true
      },
      new go.Binding("text", "label").makeTwoWay())
  );

  myDiagram.linkTemplate = $(go.Link,
    {
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
      new go.Binding("stroke", "color"),
      new go.Binding("strokeWidth", "strokeWidth")),
    $(go.Shape,
      {
        toArrow: "OpenTriangle",
        strokeWidth: 1
      },
      new go.Binding("stroke", "color"),
      new go.Binding("fill", "color")),
    $(go.Panel, "Table",
      $(go.TextBlock,
        {
          row: 0,
          font: "italic 10px sans-serif",
          editable: true
        },
        new go.Binding("text", "affinite").makeTwoWay()
      ),
      $(go.TextBlock,
        {
          row: 1,
          font: "italic 10px sans-serif",
          editable: true
        },
        new go.Binding("text", "commentaire").makeTwoWay()
      )
    )
  );

  setupButtons();
  setupColorPanel();
  loadData();
}

function setupButtons() {
  document.getElementById("addBlockBtn").onclick = () => {
    myDiagram.startTransaction("add node");
    myDiagram.model.addNodeData({
      key: "node_" + Date.now(),
      label: "Nouvel Acteur",
      fill: "#b7d8f7"
    });
    myDiagram.commitTransaction("add node");
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
    myDiagram.commandHandler.deleteSelection();
  };

  document.getElementById("strokeWidthRange").oninput = (e) => {
    const selected = myDiagram.selection.first();
    if (selected instanceof go.Link) {
      myDiagram.startTransaction("change width");
      myDiagram.model.setDataProperty(selected.data, "strokeWidth", parseInt(e.target.value));
      myDiagram.commitTransaction("change width");
    }
  };

  document.getElementById("applyAffinite").onclick = () => {
    const aff = document.getElementById("affinitySelect").value;
    const selected = myDiagram.selection.first();
    if (selected instanceof go.Link) {
      myDiagram.startTransaction("set affinite");
      myDiagram.model.setDataProperty(selected.data, "affinite", aff);
      myDiagram.commitTransaction("set affinite");
    }
  };

  document.getElementById("applyComment").onclick = () => {
    const comment = document.getElementById("commentInput").value;
    const selected = myDiagram.selection.first();
    if (selected instanceof go.Link) {
      myDiagram.startTransaction("set comment");
      myDiagram.model.setDataProperty(selected.data, "commentaire", comment);
      myDiagram.commitTransaction("set comment");
    }
  };

  myDiagram.addDiagramListener("ObjectSingleClicked", (e) => {
    const part = e.subject.part;
    if (!part) return;

    if (selectedColor) {
      myDiagram.startTransaction("apply color");
      if (part instanceof go.Node) {
        myDiagram.model.setDataProperty(part.data, "fill", selectedColor);
      } else if (part instanceof go.Link) {
        myDiagram.model.setDataProperty(part.data, "color", selectedColor);
      }
      myDiagram.commitTransaction("apply color");
      selectedColor = null;
      return;
    }

    if (!selectedTool || !(part instanceof go.Node)) return;

    if (!tempFromNode) {
      tempFromNode = part;
    } else {
      const from = tempFromNode.data.key;
      const to = part.data.key;

      const data = {
        from,
        to,
        color: "#333",
        strokeWidth: 2,
        affinite: "",
        commentaire: ""
      };

      myDiagram.model.addLinkData(data);

      if (selectedTool === "double") {
        myDiagram.model.addLinkData({ ...data, from: to, to: from });
      }

      selectedTool = null;
      tempFromNode = null;
    }
  });
}

function setupColorPanel() {
  const colors = ["#58B19F", "#f8c291", "#82ccdd", "#f6b93b", "#F97F51", "#a29bfe", "#ff7675", "#00b894"];
  const panel = document.getElementById("colorPanel");

  panel.innerHTML = "";
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

function loadData() {
  Promise.all([
    fetch('../php/dashboard.php').then(res => res.json()),
    fetch('../php/get_relations_informelles.php').then(res => res.json())
  ]).then(([acteurs, relationsInformelles]) => {
    const nodes = acteurs.map(a => ({
      key: "act_" + a.id_acteur,
      label: a.prenom + " " + a.nom,
      parent: a.id_acteur_superieur ? "act_" + a.id_acteur_superieur : undefined,
      fill: "#b7d8f7"
    }));

    const linksHierarchiques = acteurs
      .filter(a => a.id_acteur_superieur)
      .map(a => ({
        from: "act_" + a.id_acteur_superieur,
        to: "act_" + a.id_acteur
      }));

    myDiagram.model = new go.GraphLinksModel(nodes, linksHierarchiques);

    if (Array.isArray(relationsInformelles)) {
      relationsInformelles.forEach(r => {
        myDiagram.model.addLinkData({
          from: "act_" + r.id_acteur_source,
          to: "act_" + r.id_acteur_cible,
          color: getLinkColor(r.nature_relation),
          strokeWidth: impactToWidth(r.impact_source_vers_cible),
          type_relation: r.type_relation,
          nature_relation: r.nature_relation,
          commentaire: r.commentaire || "",
          affinite: r.affinite || "",
          id_relation_informelle: r.id_relation_informelle
        });
      });
    }
  });
}

function deleteRelation(linkData) {
  if (!confirm("Supprimer cette relation ?")) return;

  fetch('../php/delete_relation_informelle.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_relation_informelle: linkData.id_relation_informelle })
  })
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      myDiagram.model.removeLinkData(linkData);
    } else {
      alert("Erreur: " + result.error);
    }
  });
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

window.addEventListener("DOMContentLoaded", init);
