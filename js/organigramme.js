fetch('http://localhost/Projet/php/organigramme.php')
    .then(response => response.json())
    .then(data => {
        console.log("📢 Données récupérées :", data); // Vérification

        // Transformation des données en arbre
        const actors = {};
        data.forEach(d => {
            actors[d.id_acteur] = {
                id: d.id_acteur,
                name: d.nom + ' ' + d.prenom,
                role: d.role_entreprise,
                children: []
            };
        });

        data.forEach(d => {
            if (d.id_acteur_superieur && actors[d.id_acteur_superieur]) {
                actors[d.id_acteur_superieur].children.push(actors[d.id_acteur]);
            }
        });

        // Trouver la racine (CEO)
        const rootActor = data.find(d => d.id_acteur_superieur === null);
        if (!rootActor) {
            console.error("❌ Aucune racine trouvée !");
            return;
        }
        
        const root = d3.hierarchy(actors[rootActor.id_acteur]);

        // Dimensions du graphe
        const width = 1000, height = 600;

        const treeLayout = d3.tree().size([height - 100, width - 200]);
        treeLayout(root);

        // Créer le SVG et centrer le graphe
        const svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(100,50)");

        // Ajouter les liens (arêtes)
        svg.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
            )
            .style("fill", "none")
            .style("stroke", "#555")
            .style("stroke-width", "2px");

        // Ajouter les nœuds (cercles)
        const nodes = svg.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        nodes.append("circle")
            .attr("r", 15)
            .style("fill", d => d.depth === 0 ? "#ff5733" : "#69b3a2") // Rouge pour CEO, vert pour les autres
            .style("stroke", "#333")
            .style("stroke-width", "2px");

        // Ajouter le texte (Nom + Rôle)
        nodes.append("text")
            .attr("dy", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#333")
            .text(d => d.data.name);

        nodes.append("text")
            .attr("dy", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#666")
            .text(d => d.data.role);
    })
    .catch(error => console.error("❌ Erreur lors de la récupération des données :", error));
