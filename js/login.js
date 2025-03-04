const openButton = document.querySelector("#openMenu");
const dialog = document.querySelector("#menuDialog");

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
