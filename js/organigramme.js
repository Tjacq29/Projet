function initDiagram(data) {
    var $ = go.GraphObject.make;

    var diagram = $(go.Diagram, "diagramDiv", {
        layout: $(go.TreeLayout, { 
            angle: 90, 
            layerSpacing: 80, //  Espacement augmenté entre les niveaux
            nodeSpacing: 30  //  Meilleur alignement des branches
        }),
        "undoManager.isEnabled": true
    });

    //  Définition du modèle de chaque nœud avec design amélioré
    diagram.nodeTemplate =
        $(go.Node, "Auto",
            { click: function(e, obj) { showModal(obj.part.data); } }, // Affichage de la modale au clic
            $(go.Shape, "RoundedRectangle", { 
                strokeWidth: 2, 
                stroke: "#388E3C", 
                fill: $(go.Brush, "Linear", { 0: "#F5F5DC", 1: "#EDEADE" }), // Blanc Cassé
 
                width: 250, height: 70, // Taille des nœuds
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

    // Personnalisation des liens entre les nœuds
    diagram.linkTemplate =
        $(go.Link,
            { routing: go.Link.Orthogonal, corner: 10 },
            $(go.Shape, { stroke: "#388E3C", strokeWidth: 2 }),  //  Lignes en vert foncé
            $(go.Shape, { toArrow: "Standard", fill: "#388E3C", stroke: "#2E7D32" })
        );

    diagram.model = new go.TreeModel(data);
}

// Fonction pour afficher la fenêtre modale
function showModal(data) {
    document.getElementById("modal-title").innerText = data.text;
    document.getElementById("modal-role").innerText = data.role;
    document.getElementById("modal-age").innerText = data.age || "Non précisé";
    document.getElementById("modal-sector").innerText = data.sector || "Non précisé";

    document.getElementById("modal").style.display = "block";
}

// Fonction pour fermer la fenêtre modale
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// 📡 Chargement des données via Fetch
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
