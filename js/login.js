const openButton = document.querySelector("#openMenu");
const dialog = document.querySelector("#menuDialog");

document.addEventListener("DOMContentLoaded", function () {
    // Sélectionne le bouton submit
    const submitButton = document.querySelector("button[type='submit']");

    // Vérifie si le bouton existe avant d'ajouter l'événement
    if (submitButton) {
        submitButton.addEventListener("click", function () {
            console.log("Click");
        });
    } else {
        console.error("Bouton submit non trouvé !");
    }
});


openButton.addEventListener("click", () => {
    if (!dialog.open) {
        dialog.showModal();
    } else {
        dialog.close();
    }
});

dialog.addEventListener("click", ({ target }) => {
    if (target.nodeName === "DIALOG") {
        dialog.close("dismiss");
    }
});
document.querySelector("form").addEventListener("submit", function(event) {
    console.log("Formulaire soumis !");
});

document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.querySelector("button[type='submit']");

    if (submitButton) {
        console.log("Bouton détecté !");
        submitButton.addEventListener("click", function () {
            console.log("Click détecté !");
        });
    } else {
        console.error("⚠️ Bouton submit non trouvé !");
    }
});
