function initDiagram(data) {
    var $ = go.GraphObject.make;

    var diagram = $(go.Diagram, "diagramDiv", {
        layout: $(go.TreeLayout, { 
            angle: 90, 
            layerSpacing: 80, 
            nodeSpacing: 30 
        }),
        "undoManager.isEnabled": true
    });

    // Fonction pour vérifier si un nœud peut être déplacé sur un autre
    function mayWorkFor(node1, node2) {
        if (!(node1 instanceof go.Node) || !(node2 instanceof go.Node)) return false;
        if (node1 === node2) return false; // Ne peut pas être son propre supérieur
        if (node2.isInTreeOf(node1)) return false; // Ne peut pas travailler sous son subordonné
        return true;
    }

    // Définition du modèle de nœud avec gestion du glisser-déposer
    diagram.nodeTemplate = $(go.Node, "Auto",
        {
            click: function(e, obj) { showModal(obj.part.data); }, 

            // Indique qu'on peut déposer un nœud ici
            mouseDragEnter: function(e, node) {
                var selnode = diagram.selection.first();
                if (mayWorkFor(selnode, node)) {
                    console.log("Entrée de :", selnode.data.text, "sur", node.data.text);
                    node.findObject("SHAPE").fill = "lightblue"; 
                }
            },
            mouseDragLeave: function(e, node) {
                console.log("Sortie de :", node.data.text);
                node.findObject("SHAPE").fill = "white"; 
            },
            mouseDrop: function(e, node) {
                var selnode = diagram.selection.first();
                if (mayWorkFor(selnode, node)) {
                    console.log("Déplacement validé :", selnode.data.text, "devient sous", node.data.text);

                    var model = diagram.model;
                    model.startTransaction("Modifier parent");
                    model.set(selnode.data, "parent", node.data.key);
                    model.commitTransaction("Modifier parent");

                    // Met à jour la base de données
                    updateHierarchy(selnode.data.key, node.data.key);
                } else {
                    console.log("Déplacement non autorisé !");
                }
            }
        },
        $(go.Shape, "RoundedRectangle", { 
            name: "SHAPE",
            strokeWidth: 2, 
            stroke: "#388E3C", 
            fill: "white",
            width: 250, height: 70,
            shadowVisible: true
        }),
        $(go.Panel, "Table",
            { margin: 10 },
            $(go.RowColumnDefinition, { column: 1, width: 100 }),
            $(go.TextBlock,
                { row: 0, column: 0, font: "bold 14px sans-serif", stroke: "black" },
                new go.Binding("text", "text")),
            $(go.TextBlock,
                { row: 1, column: 0, font: "italic 12px sans-serif", stroke: "black", margin: new go.Margin(4, 0, 0, 0) },
                new go.Binding("text", "role"))
        )
    );

    // Définition du modèle de lien
    diagram.linkTemplate = $(go.Link,
        { routing: go.Link.Orthogonal, corner: 10 },
        $(go.Shape, { stroke: "#388E3C", strokeWidth: 2 }),
        $(go.Shape, { toArrow: "Standard", fill: "#388E3C", stroke: "#2E7D32" })
    );

    // Initialisation du modèle
    diagram.model = new go.TreeModel(data);
}

// Fonction pour envoyer la mise à jour de la relation au backend
function updateHierarchy(actorId, newSupervisorId) {
    fetch('../php/updateHierarchy.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_acteur: actorId,
            id_acteur_superieur: newSupervisorId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Mise à jour réussie:", data);
    })
    .catch(error => console.error("Erreur lors de la mise à jour:", error));
}

// 📡 Chargement des données et initialisation du diagramme
fetch('../php/dashboard.php')
    .then(response => response.json())
    .then(data => {
        console.log("Données reçues:", data);

        const formattedData = data.map(person => ({
            key: String(person.id_acteur),
            text: person.prenom + " " + person.nom,
            role: person.role_entreprise || "Non défini",
            age: person.age || "Non précisé",
            sector: person.secteur || "Non précisé",
            parent: person.id_acteur_superieur ? String(person.id_acteur_superieur) : undefined
        }));

        console.log("Données formatées pour GoJS:", formattedData);

        initDiagram(formattedData);
    })
    .catch(error => console.error("Erreur lors du chargement des données:", error));
