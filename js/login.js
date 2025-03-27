document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);

        fetch("../php/login.php", {
            method: "POST",
            body: formData,
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Stocker l'utilisateur connecté
                sessionStorage.setItem("userId", data.userId);
                sessionStorage.setItem("prenom", data.prenom); // Pour "Bonjour Prénom"
                // Redirection vers l'accueil
                window.location.href = "../html/index.html";
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Erreur AJAX :", error);
            alert("Une erreur est survenue.");
        });
    });
});
