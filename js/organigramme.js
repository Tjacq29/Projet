var $ = go.GraphObject.make;
var myDiagram; // Déclaration globale pour éviter les erreurs


fetch('../php/get_user.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem("userId", data.userId);
            sessionStorage.setItem("role", data.role);
            console.log("Utilisateur connecté, ID stocké :", data.userId);
        } else {
            console.error("Utilisateur non identifié :", data.message);
            alert("Vous devez être connecté !");
            window.location.href = "../html/login.html";
        }
    })
    .catch(error => console.error("Erreur lors de la récupération de l'utilisateur :", error));

function initDiagram(data) {
    myDiagram = $(go.Diagram, "diagramDiv", { // Assignation à myDiagram
        layout: $(go.TreeLayout, { 
            angle: 90, 
            layerSpacing: 80, // Espacement augmenté entre les niveaux
            nodeSpacing: 30  // Meilleur alignement des branches
        }),
        "undoManager.isEnabled": true
    });

    //  Définition du modèle de chaque nœud avec design amélioré
    myDiagram.nodeTemplate =
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
    myDiagram.linkTemplate =
        $(go.Link,
            { routing: go.Link.Orthogonal, corner: 10 },
            $(go.Shape, { stroke: "#388E3C", strokeWidth: 2 }),  // Lignes en vert foncé
            $(go.Shape, { toArrow: "Standard", fill: "#388E3C", stroke: "#2E7D32" })
        );

    myDiagram.model = new go.TreeModel(data);
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

function saveGraph() {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
        alert("Utilisateur non connecté !");
        return;
    }

    const graphData = myDiagram.model.toJson(); // JSON des données du graphe

    // 🔥 Génère une image complète du graphe
    const imageData = myDiagram.makeImageData({ scale: 1, background: "white" }); // base64 PNG

    // Convertir base64 en blob
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
                alert("Organigramme enregistré avec succès !");
                
                const role = sessionStorage.getItem("role");
                if (role === "prof") {
                    window.location.href = "../html/admin_view.html";
                }
                // Sinon, élève : on reste sur la page
            }
            
        })
        .catch(err => {
            console.error("Erreur :", err);
            alert("Erreur d'enregistrement.");
        });
}



function graph_informel() {
    window.location.href = "../html/graph_informel.html";
}
