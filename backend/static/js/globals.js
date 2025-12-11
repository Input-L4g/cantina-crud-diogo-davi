
/** @type {HTMLDivElement} */
export const globalOverlay = document.getElementById("overlay");
/** @type {HTMLDialogElement} */
export const globalDialog = document.getElementById("dialog-modal");
/** @type {HTMLDivElement} */
export const globalDialogContainer = document.getElementById("dialog-modal-container");

export const buttonsOpenDialogMap = {
    // IdBotão: [classNameContainer, tipoContainer]
    "btn-add-product": ["head add-product", "add-product"],
    "btn-edit": ["head add-product", "edit"],
    "btn-search": ["head search", "search"],
    "btn-delete-selected": ["head delete", "delete-selected"],
    "btn-remove": ["head delete", "remove"],
    "btn-loading": ["head loading", "loading"]
}

export const minScrollForAllDown = 200;
export const categories = ["Salgado", "Bebida", "Refeições"]

export const API_URL = "http://127.0.0.1:5000/api/";

export let globalListenerArgs = {};
