import {
    uncheckAllCheckBoxEvent,
    checkAllCheckBoxEvent,
    loadEventListeners,
    closeOverlayEvent,
    openOverlayEvent,
    toTopEvent
} from "./events.js";
import { globalListenerArgs } from "./globals.js";
import { applyCallbackInElements, getIdRowFromElement, searchParent, mergeObjectInPlace } from "./utils.js";

const headerNameDeleteSelected = document.querySelector(".column.action .cell.header");
const deleteSelectedsButton = document.getElementById("btn-delete-selected");
const allCheckBoxButton = document.getElementById("all-checkbox");
const toTopButton = document.querySelector("#button-alldown");
const buttonsOpenDialog = [
    document.querySelector("#btn-search"),
    document.querySelector("#btn-add-product"),
    deleteSelectedsButton
]
const buttonsCloseDialog = [
    document.querySelector("#btn-red")
];
/** @param {any} e Detalhe extra do disparo do evento. */
const onButtonOpenDialogClick = (e) => window.dispatchEvent(openOverlayEvent(
    {
        target: e.currentTarget,
        payload: {
            rowId: getIdRowFromElement(searchParent(e.currentTarget, "cell")),
            nameInput: document.getElementById("input-add-product"),
            categorySelect: document.getElementById("select-category-product"),
            priceInput: document.getElementById("price-add-product")
        }
    }
))
const onButtonCloseDialogClick = () => window.dispatchEvent(closeOverlayEvent);

export function indexListeners() {
    // Faz o dialog abrir ao clicar em qualquer botão em buttonsOpenDialog
    applyCallbackInElements("click", onButtonOpenDialogClick, buttonsOpenDialog);
    applyCallbackInElements("click", onButtonOpenDialogClick, document.querySelectorAll(".opt.edit"));
    applyCallbackInElements("click", onButtonOpenDialogClick, document.querySelectorAll(".opt.remove"));
    // Faz o dialog fechar ao apertar algum botão que é para fecha-lo
    applyCallbackInElements("click", onButtonCloseDialogClick, buttonsCloseDialog);
    //Faz o topButton subir a página até o topo
    toTopButton.addEventListener("click", () => dispatchEvent(toTopEvent));
    allCheckBoxButton.addEventListener("change", () => {
        if (allCheckBoxButton.checked)
            window.dispatchEvent(checkAllCheckBoxEvent);
        else
            window.dispatchEvent(uncheckAllCheckBoxEvent);
    })
};

mergeObjectInPlace(globalListenerArgs, {
    toTopButton,
    deleteSelectedsButton,
    headerNameDeleteSelected,
    allCheckBoxButton
})

loadEventListeners();
indexListeners();
