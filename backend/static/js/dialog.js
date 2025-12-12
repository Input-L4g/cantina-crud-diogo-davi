import { openOverlayEvent, submitProductEvent, removeProductEvent, closeOverlayEvent } from "./events.js";
import { globalDialogContainer, buttonsOpenDialogMap, categories } from "./globals.js";
import { refeshTable } from "./submit.js";
import { getCheckedRows, getRow, searchInTable } from "./table.js";
import { getIdRowFromElement } from "./utils.js";

/**
 * Cria um mapeamento em Object do className
 * dos childrens de `dialogContents` para o children.
 * @returns {Object<string, HTMLElement>} Map dos childrens.
 */
function mapDialogContents() {
    /** @type {Object} */
    const map = {};
    for (const children of dialogContents) {
        let name = children.className
        name = name.split(" ").slice(0, 2).join(" ");
        map[name] = children;
    }
    return map;
}
/** @type {HTMLCollectionOf<HTMLElement>} */
const dialogContents = globalDialogContainer.children;
const dialogContentsMap = mapDialogContents();
const dialogBtnGreen = document.getElementById("btn-green");
const dialogBtnRed = document.getElementById("btn-red");
const dialogTail = document.getElementById("dialog-tail");
const displayOn = "flex";
const displayOff = "none";

/**
 * Define o display de um array de elementos.
 * @param {string} display Valor do display para todos os elementos.
 * @param {HTMLCollectionOf<HTMLElement> | HTMLElement[]} elements Array ou coleção
 * de elementos HTML.
 * @param {string[]} exceptions O className dos elementos que
 * serão ignoradas. Se null, nenhum será ignorado.
 */
function setDisplayTo(display, elements, exceptions = null) {
    const callback = (element) => {
        if (exceptions !== null && exceptions.includes(element.className))
            return;
        element.style.display = display;
    }
    if (Array.isArray(elements))
        elements.forEach(callback);
    else
        for (const element of elements) {
            callback(element);
        };
}

/**
 * Define um texto para os botões verde e vermelho
 * no dialog tail.
 * @param {string | null} btnGreenText Texto do botão verde.
 * @param {string | null} btnRedText Texto do botão vermelho.
 */
function setTextInButtonTail(btnGreenText = null, btnRedText = null) {
    if (btnGreenText !== null)
        dialogBtnGreen.textContent = btnGreenText;
    if (btnRedText !== null)
        dialogBtnRed.textContent = btnRedText;
}

/**
 * Carrega o conteúdo de exclusão do dialog.
 * @param {string} deleteTypeName Tipo de exclusão.
 * Só pode ser "remove" ou "delete-selected".
 */
function loadDeleteContent(containerType, payload) {
    const targetClassName = "head delete";
    const btnGreenContent = "CANCELAR";
    let btnRedContent = "EXCLUIR";
    let headContent = "Tem certeza que deseja excluir este item?";
    console.log(containerType);
    if (containerType === "delete-selected") {
        headContent = "Tem certeza que deseja excluir todos os selecionados?";
        btnRedContent = "EXCLUIR TODOS";
    }
    dialogBtnRed.addEventListener("click", () => {
        window.dispatchEvent(removeProductEvent({
            submitType: containerType,
            productData: {
                id: containerType === "delete-selected"? getCheckedRows()
                .map((cell) => getIdRowFromElement(cell[0])
                ):payload.rowId,
                name: document.getElementById("input-add-product").value,
                category: document.getElementById("select-category-product").value,
                price: document.getElementById("price-add-product").value.replace(/,/g, ".").replace(/[^0-9.]/g, "")
            }
        }));
    }, { once: true });
    dialogBtnGreen.addEventListener("click", () => {
        window.dispatchEvent(closeOverlayEvent);
    }, { once: true });
    const deleteContainer = dialogContentsMap[targetClassName];
    deleteContainer.querySelector("#delete-title").textContent = headContent;
    setTextInButtonTail(btnGreenContent, btnRedContent);
    setDisplayTo(displayOn, [deleteContainer]);
    setDisplayTo(displayOn, [dialogTail]);
}

function loadSearchContent(containerType) {
    refeshTable();
    const targetClassName = "head search";
    if (containerType !== "search")
        return;
    const searchContainer = dialogContentsMap[targetClassName];
    window.addEventListener("keydown", (e) => {
        const input = searchContainer.querySelector(".search-input");
        if (e.key === "Enter" && document.activeElement === input && input.value.trim() !== "") {
            const search = searchInTable(input.value.trim());
            if (search.length > 0) {
                document.getElementById("search-message").textContent = "";
                window.dispatchEvent(closeOverlayEvent);
            } else
                document.getElementById("search-message").textContent = "Produto não encontrado.";
        }
    });
    setDisplayTo(displayOn, [dialogBtnGreen]);
    setDisplayTo(displayOn, [searchContainer]);
}

function loadAddProductContent(containerType, payload) {
    const targetClassName = "head add-product";
    const btnRedText = "CANCELAR";
    let titleText = "Adicionar Produto";
    let btnGreenText = "ADICIONAR";
    const containerName = containerType === "edit"? "update": "add";
    dialogBtnGreen.addEventListener("click", () => {
        window.dispatchEvent(submitProductEvent({
            submitType: containerName,
            productData: {
                id: payload.rowId,
                name: document.getElementById("input-add-product").value,
                category: document.getElementById("select-category-product").value,
                price: document.getElementById("price-add-product").value.replace(/,/g, ".").replace(/[^0-9.]/g, "")
            }
        }));
    }, { once: true });
    if (containerType === "edit") {
        const { rowId, nameInput, categorySelect, priceInput } = payload;
        const { name, category, price } = getRow(rowId, false);
        titleText = "Editar Produto";
        btnGreenText = "EDITAR";
        nameInput.value = name.textContent;
        categorySelect.value = categories.includes(category.textContent)? category.textContent:"";
        priceInput.value = price.textContent;
    }
    const addProductContainer = dialogContentsMap[targetClassName];
    if (containerType !== "edit") {
        addProductContainer.querySelectorAll("input").forEach((input) => input.value = "");
        addProductContainer.querySelectorAll("select").forEach((select) => select.value = "")
    }
    addProductContainer.querySelector("#add-product-title").textContent = titleText;
    setTextInButtonTail(btnGreenText, btnRedText);
    setDisplayTo(displayOn, [addProductContainer]);
    setDisplayTo(displayOn, [dialogTail]);
}

function loadLoadingContent() {
    const targetClassName = "head loading";
    const loadingContainer = dialogContentsMap[targetClassName];
    setDisplayTo(displayOn, [loadingContainer]);
}

export function showLoading() {
    setDisplayTo(displayOff, dialogContents);
    setDisplayTo(displayOff, [dialogTail]);
    window.dispatchEvent(openOverlayEvent({ target: {id: "btn-loading"} }));
    loadLoadingContent();
}

/**
 * Carrega dinâmicamente o conteúdo do dialog global.
 * @param {string} btnId className do container que será
 * carregado.
 */
export function loadDialogContent(btnId, payload) {
    setDisplayTo(displayOff, dialogContents);
    setDisplayTo(displayOff, [dialogTail]);
    /** @type {Array<string, string>} */
    if (!btnId.startsWith("btn-"))
        btnId = "btn-" + btnId;
    const [containerName, containerType] = buttonsOpenDialogMap[btnId];
    if (containerName.startsWith("head delete"))
        loadDeleteContent(containerType, payload);
    else if (containerName.startsWith("head search"))
        loadSearchContent(containerType, payload);
    else if (containerName.startsWith("head add-product"))
        loadAddProductContent(containerType, payload);
    else if (containerName.startsWith("head loading"))
        loadLoadingContent(containerType, payload);
}
