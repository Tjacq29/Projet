document.addEventListener('DOMContentLoaded', function () {
    var $ = go.GraphObject.make;
    
    var diagram = $(go.Diagram, "organigramme", {
        layout: $(go.TreeLayout, { angle: 90, layerSpacing: 30 }),
        "undoManager.isEnabled": true
    });

    // Fonction pour récupérer la couleur en fonction du rôle
    function getColor(role) {
        switch (role) {
            case 'Directeur Général': return "#FEBA00";
            case 'Responsable': return "#679DDA";
            case 'Manager': return "#58ADA7";
            default: return "#A2DAFF";
        }
    }

    // Modèle des nœuds
    diagram.nodeTemplate = $(go.Node, "Auto",
        { click: onNodeClick }, // Événement au clic
        $(go.Shape, "RoundedRectangle", { strokeWidth: 2, fill: "white" },
            new go.Binding("fill", "role", getColor)
        ),
        $(go.Panel, "Table",
            $(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
            $(go.TextBlock, { row: 0, margin: 5, font: "bold 14px Poppins", stroke: "#333" },
                new go.Binding("text", "nom")
            ),
            $(go.TextBlock, { row: 1, margin: 5, font: "12px Poppins", stroke: "#666" },
                new go.Binding("text", "role")
            )
        )
    );

    // Modèle des liens
    diagram.linkTemplate = $(go.Link,
        { routing: go.Link.Orthogonal, corner: 5 },
        $(go.Shape, { stroke: "#686E76", strokeWidth: 1 })
    );

    // Charger les données depuis PHP
    fetch('../php/organigramme.php')
        .then(response => response.json())
        .then(data => {
            console.log("Données reçues :", data);
            diagram.model = new go.TreeModel(data);
        })
        .catch(error => console.error('Erreur lors du chargement des données:', error));

    // Fonction au clic sur un nœud
    function onNodeClick(e, node) {
        var data = node.data;
        console.log("Acteur sélectionné :", data); // Vérifie que les données sont bien là
    
        var infoDiv = document.getElementById("actor-info");
        infoDiv.innerHTML = `
            <h3>${data.nom} ${data.prenom}</h3>
            <p><strong>Âge:</strong> ${data.age ? data.age : "Non renseigné"}</p>
            <p><strong>Rôle:</strong> ${data.role}</p>
            <p><strong>Secteur:</strong> ${data.secteur ? data.secteur : "Non renseigné"}</p>
            <p><strong>Subordonnés:</strong> ${diagram.findTreeChildrenNodes(node).count}</p>
        `;
        infoDiv.style.display = "block";
    }
}
);      