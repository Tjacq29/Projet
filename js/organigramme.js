var $ = go.GraphObject.make;
var myDiagram;

fetch('../php/get_user.php')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem("role", data.role);
    } else {
      alert("Vous devez être connecté !");
      window.location.href = "../html/login.html";
    }
  });

function initDiagram(data) {
  myDiagram = $(go.Diagram, "diagramDiv", {
    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 80,
      nodeSpacing: 30
    }),
    "undoManager.isEnabled": true,
    allowZoom: true,
    allowMove: true
  });

  // ✅ Zoom à la molette (indépendamment du scroll de page)
  myDiagram.toolManager.mouseWheelBehavior = "zoom";

  // 🎨 Nœud stylisé
  myDiagram.nodeTemplate =
    $(go.Node, "Auto",
      {
        click: (e, obj) => showModal(obj.part.data),
        cursor: "pointer"
      },
      $(go.Shape, "RoundedRectangle",
        {
          strokeWidth: 1,
          stroke: "#888",
          fill: "white"
        },
        new go.Binding("fill", "sector", getColorBySector)
      ),
      $(go.Panel, "Vertical",
        { margin: 8 },
        $(go.TextBlock,
          {
            font: "bold 14px 'Poppins', sans-serif",
            stroke: "#333"
          },
          new go.Binding("text", "text")),
        $(go.TextBlock,
          {
            font: "12px 'Poppins', sans-serif",
            stroke: "#555"
          },
          new go.Binding("text", "role"))
      )
    );

  myDiagram.linkTemplate =
    $(go.Link,
      { routing: go.Link.Orthogonal, corner: 10 },
      $(go.Shape, { stroke: "#bbb", strokeWidth: 2 }),
      $(go.Shape, { toArrow: "Standard", fill: "#bbb", stroke: "#999" })
    );

  myDiagram.model = new go.TreeModel(data);
}

function getColorBySector(sector) {
  const colors = {
    informatique: "#82ccdd",
    vente: "#f8c291",
    finance: "#f6b93b",
    rh: "#d1ccc0",
    marketing: "#f5cd79"
  };
  return colors[sector?.toLowerCase()] || "#dcdde1";
}

function showModal(data) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-title").innerText = data.text || "";
  document.getElementById("modal-role").value = data.role || "";
  document.getElementById("modal-age").value = data.age || "";
  document.getElementById("modal-sector").value = data.sector || "";

  const customZone = document.getElementById("modal-custom");
  customZone.innerHTML = "";
  (data.extraFields || []).forEach(({ label, value }) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>${label}</label>
      <input type="text" data-label="${label}" value="${value}">
    `;
    customZone.appendChild(div);
  });

  document.getElementById("save-btn").onclick = () => {
    data.role = document.getElementById("modal-role").value;
    data.age = document.getElementById("modal-age").value;
    data.sector = document.getElementById("modal-sector").value;

    const extraInputs = modal.querySelectorAll("#modal-custom input");
    data.extraFields = Array.from(extraInputs).map(input => ({
      label: input.dataset.label,
      value: input.value
    }));

    myDiagram.model.updateTargetBindings(data);
    closeModal();
  };

  document.getElementById("add-field-btn").onclick = () => {
    const label = prompt("Nom du champ :");
    if (label) {
      const div = document.createElement("div");
      div.innerHTML = `
        <label>${label}</label>
        <input type="text" data-label="${label}">
      `;
      customZone.appendChild(div);
    }
  };

  modal.style.display = "block";

  // Fermer au clic extérieur
  window.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function saveGraph() {
  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    alert("Non connecté !");
    return;
  }

  const graphData = myDiagram.model.toJson();
  const imageData = myDiagram.makeImageData({ scale: 1, background: "white" });

  fetch(imageData)
    .then(res => res.blob())
    .then(blob => {
      const formData = new FormData();
      formData.append("image", blob, "graph.png");
      formData.append("id_utilisateur", userId);
      formData.append("json", graphData);

      return fetch("../php/save_graph_with_image.php", {
        method: "POST",
        body: formData
      });
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Organigramme enregistré !");
        const role = sessionStorage.getItem("role");
        if (role === "prof") window.location.href = "../html/admin_view.html";
      }
    })
    .catch(err => {
      console.error("Erreur :", err);
      alert("Échec de l'enregistrement.");
    });
}

function graph_informel() {
  window.location.href = "../html/graph_informel.html";
}

fetch('../php/dashboard.php')
  .then(response => response.json())
  .then(data => {
    const formatted = data.map(p => ({
      key: String(p.id_acteur),
      text: `${p.prenom} ${p.nom}`,
      role: p.role_entreprise || "Non défini",
      age: p.age || "Non précisé",
      sector: p.secteur || "Non précisé",
      parent: p.id_acteur_superieur ? String(p.id_acteur_superieur) : undefined
    }));
    initDiagram(formatted);
  })
  .catch(err => console.error("Erreur chargement données:", err));

function zoomIn() {
if (myDiagram) {
    myDiagram.commandHandler.increaseZoom();
}
}

function zoomOut() {
if (myDiagram) {
    myDiagram.commandHandler.decreaseZoom();
}
}
