import { addProductRequest, updateProductRequest, getProductRequest, removeProductRequest } from "./app.js";
import { addRow, clearAllColumns, getRow, getAllRowIds } from "./table.js";
import { showLoading } from "./dialog.js";
import { capitalize, getIdRowFromElement } from "./utils.js";
import { loadEventListeners, closeLoadingEvent } from "./events.js";
import { indexListeners } from "./index.js";

const loading = document.getElementById("loading");
const loadingText = document.getElementById("loading-message");
let idTimeOut;

export async function submitNewProduct(name, category, price) {
    try {
        const response = await addProductRequest(name, category.toLowerCase(), price);
        showLoading()
        if (!response?.success) {
            loading.classList.add("red")
            loadingText.innerHTML = "Falha ao adicionar o produto!";
        } else {
            loading.classList.add("green");
            loadingText.innerHTML = "Produto adicionado com sucesso!";
            if (idTimeOut === null)
                idTimeOut = setTimeout(() => {
                    closeLoadingEvent();
                }, 2000);
            }
    } finally {
        refeshTable();
    }
}

export async function submitUpdateProduct(id, name, category, price) {
    try {
        const response = await updateProductRequest(id, name, category.toLowerCase(), price);
        showLoading()
        if (!response?.success) {
            loading.classList.add("red")
            loadingText.innerHTML = "Falha ao tentar atualizar o produto!"
        } else {
            loading.classList.add("green");
            loadingText.innerHTML = "Produto atualizado com sucesso!";
            if (idTimeOut === null)
                idTimeOut = setTimeout(() => {
                    closeLoadingEvent();
                }, 2000);
            /** @type {Object<string, HTMLDivElement>} */
            const { nameCell, categoryCell, priceCell } = getRow(id);
            nameCell.querySelector("p").textContent = capitalize(name);
            categoryCell.querySelector("p").textContent = capitalize(category);
            priceCell.querySelector("p").textContent = "R$ " + price;
        }
    } finally {
        refeshTable();
    }
}

export async function submitDeleteProduct(id, showLoading_ = true) {
    const response = removeProductRequest(id);
    if (showLoading_)
        showLoading()
    try {
        if (!response?.success) {
            loading.classList.add("red")
            loadingText.innerHTML = "Falha ao remover o produto."
        } else {
            loading.classList.add("green");
            loadingText.innerHTML = "Produto removido com sucesso!";
            if (idTimeOut === null) {
                idTimeOut = setTimeout(() => {
                    closeLoadingEvent();
                }, 2000);
            }
        }
    } finally {
        refeshTable();
    }
}

/**
 *
 * @param {Array<>} otherTable
 */
export async function refeshTable(otherTable = null) {
    let response;
    if (otherTable === null)
        response = await getProductRequest();
    if (otherTable === null && response !== null && !response.success) {
        console.log("ERRO AO TENTAR PEGAR TODOS OS DADOS.")
        console.log(response?.error.type, response?.error.message);
    } else {
        clearAllColumns();
        if (otherTable === null) {
            response?.data.forEach(content => {
                const { id, name, category, price, time_stamp } = content;
                addRow(id, capitalize(name), capitalize(category), "R$ " + price, `Criado em: ${time_stamp}`);
            });
        } else {
            otherTable.forEach(
                /** @param {Object<string, HTMLDivElement>} cell */
                (cell) => {
                const { name, category, price } = cell;
                const id = getIdRowFromElement(name);
                const title = name.title;
                addRow(
                    id,
                    capitalize(name.textContent),
                    capitalize(category.textContent),
                    "R$ " + price.textContent.replace(/,/g, ".").replace(/[^0-9.]/g, ""), title
                );
            });
        }
        loadEventListeners();
        indexListeners();
    }
}

window.refeshTable = refeshTable;
