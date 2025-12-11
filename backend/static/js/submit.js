import { addProductRequest, updateProductRequest, getProductRequest, removeProductRequest } from "./app.js";
import { addRow, clearAllColumns, getRow } from "./table.js";
import { showLoading } from "./dialog.js";
import { capitalize } from "./utils.js";
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
            loadingText.innerHTML = `${response.message}<br>${response.error.type}${response.error.message}`
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
        console.log(id);
        const response = await updateProductRequest(id, name, category.toLowerCase(), price);
        showLoading()
        if (!response?.success) {
            loading.classList.add("red")
            loadingText.innerHTML = `${response.message}<br>${response.error.type}${response.error.message}`
        } else {
            loading.classList.add("green");
            loadingText.innerHTML = "Produto atualizado com sucesso!";
            if (idTimeOut === null)
                idTimeOut = setTimeout(() => {
                    closeLoadingEvent();
                }, 2000);
            // MUDA OS VALORES DA LINHA PELOS NOVOS

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
            loadingText.innerHTML = `${response.message}<br>${response.error.type}${response.error.message}`
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

export async function refeshTable() {
    const response = await getProductRequest();
    if (response !== null && !response.success) {
        console.log("ERRO AO TENTAR PEGAR TODOS OS DADOS.")
        console.log(response?.error.type, response?.error.message);
    } else {
        clearAllColumns();
        response?.data.forEach(content => {
            const { id, name, category, price, time_stamp } = content;
            addRow(id, capitalize(name), capitalize(category), "R$ " + price, `Criado em: ${time_stamp}`);
        });
        loadEventListeners();
        indexListeners();
    }
}

window.refeshTable = refeshTable;
