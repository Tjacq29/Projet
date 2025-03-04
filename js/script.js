const openButton = document.querySelector("#openMenu");
const dialog = document.querySelector("dialog");

openButton.addEventListener("click", () => {
    dialog.showModal();
});

dialog.addEventListener("click", ({ target }) => {
    if (target.nodeName === "DIALOG") {
        dialog.close("dismiss");
    }
});
