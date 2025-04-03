// DEMO simplifiée : organigramme + relations informelles claires avec GoJS

let diagram;

function init() {
  const $ = go.GraphObject.make;

  diagram = $(go.Diagram, "myDiagramDiv", {
    layout: $(go.TreeLayout, { angle: 90, layerSpacing: 100 }),
    "undoManager.isEnabled": true,
    allowLink: false,
    "linkingTool.direction": go.LinkingTool.ForwardsOnly
  });

  diagram.nodeTemplate = $(go.Node, "Auto",
    { width: 180, height: 60 },
    $(go.Shape, "RoundedRectangle", {
      fill: "#dae8fc", stroke: "#6c8ebf", strokeWidth: 2
    }),
    $(go.TextBlock, {
      margin: 8,
      font: "bold 14px sans-serif",
      stroke: "#333",
      wrap: go.TextBlock.WrapFit
    }, new go.Binding("text", "label"))
  );

  diagram.linkTemplateMap.add("informel",
    $(go.Link,
      {
        routing: go.Link.Orthogonal,
        corner: 10,
        curve: go.Link.Normal,
        layerName: "Foreground",
        selectionAdorned: false
      },
      $(go.Shape,
        new go.Binding("stroke", "nature", getLinkColor),
        new go.Binding("strokeWidth", "impact", getImpactWidth),
        { strokeDashArray: [4, 2] }
      ),
      $(go.Shape, {
        toArrow: "OpenTriangle",
        fill: null,
        strokeWidth: 1.5
      },
        new go.Binding("stroke", "nature", getLinkColor)),
      $(go.TextBlock, {
        segmentOffset: new go.Point(0, -10),
        font: "italic 10px sans-serif"
      }, new go.Binding("text", "type"))
    )
  );

  const nodeDataArray = [
    { key: 1, label: "CEO" },
    { key: 2, label: "Manager RH", parent: 1 },
    { key: 3, label: "Manager Tech", parent: 1 },
    { key: 4, label: "Dév. Front", parent: 3 },
    { key: 5, label: "Dév. Back", parent: 3 }
  ];

  const linkDataArray = []; // pas de lien informel au départ

  diagram.model = new go.TreeModel(nodeDataArray);

  document.getElementById("addRelationBtn").onclick = () => {
    const from = prompt("ID source (ex: 2)");
    const to = prompt("ID cible (ex: 4)");
    const type = prompt("Type de relation (ex: mentorat)");
    const nature = prompt("Nature (Positive/Négative/Neutre)");
    const impact = prompt("Impact (Faible/Moyen/Fort)");

    diagram.model.addLinkData({
      from: Number(from),
      to: Number(to),
      type,
      nature,
      impact,
      category: "informel"
    });
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

function getImpactWidth(impact) {
  switch (impact) {
    case "Faible": return 1;
    case "Moyen": return 3;
    case "Fort": return 5;
    default: return 2;
  }
}

window.addEventListener("DOMContentLoaded", init);
