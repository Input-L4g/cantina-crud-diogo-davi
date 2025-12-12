import { closeOverlayEvent } from "./events.js";
import { refeshTable } from "./submit.js";
import { getIdRowFromElement, parseBrazilianDate } from "./utils.js";

const sortByNewest = (a, b) => {
    const dateA = parseBrazilianDate(a.getAttribute("title"));
    const dateB = parseBrazilianDate(b.getAttribute("title"));

    return dateB - dateA; 
};

const sortByOldest = (a, b) => {
    const dateA = parseBrazilianDate(a.getAttribute("title"));
    const dateB = parseBrazilianDate(b.getAttribute("title"));

    return dateA - dateB;
};

const sortByNameAZ = (a, b) => {
    const nameA = a.querySelector("p").textContent;
    const nameB = b.querySelector("p").textContent;
    return nameA.localeCompare(nameB, "pt-BR");  // Ordena de A-Z
};
const sortByNameZA = (a, b) => {
    const nameA = a.querySelector("p").textContent;
    const nameB = b.querySelector("p").textContent;
    return nameB.localeCompare(nameA, "pt-BR");  // Ordena de Z-A
};
const sortByPriceHigh = (a, b) => {
    const priceA = parseFloat(a.querySelector("p").textContent.replace("R$", "").trim());
    const priceB = parseFloat(b.querySelector("p").textContent.replace("R$", "").trim());
    return priceB - priceA;  // Preço maior vem primeiro
};
const sortByPriceLow = (a, b) => {
    const priceA = parseFloat(a.querySelector("p").textContent.replace("R$", "").trim());
    const priceB = parseFloat(b.querySelector("p").textContent.replace("R$", "").trim());
    return priceA - priceB;  // Preço menor vem primeiro
};
const sortByCategoryAZ = (a, b) => {
    const categoryA = a.querySelector("p").textContent;
    const categoryB = b.querySelector("p").textContent;
    return categoryA.localeCompare(categoryB, "pt-BR");  // Ordena de A-Z
};
const sortByCategoryZA = (a, b) => {
    const categoryA = a.querySelector("p").textContent;
    const categoryB = b.querySelector("p").textContent;
    return categoryB.localeCompare(categoryA, "pt-BR");  // Ordena de Z-A
};


const sortCallbacks = {
    "Mais recente": [sortByNewest, "name"],
    "Mais antigo": [sortByOldest, "name"],
    "Nome (A-Z)": [sortByNameAZ, "name"],
    "Nome (Z-A)": [sortByNameZA, "name"],
    "Preço (maior)": [sortByPriceHigh, "price"],
    "Preço (menor)": [sortByPriceLow, "price"],
    "Categoria (A-Z)": [sortByCategoryAZ, "category"],
    "Categoria (Z-A)": [sortByCategoryZA, "category"]
};

const checkboxColumn = document.querySelector(".column.checkbox");
const nameColumn = document.querySelector(".column.name");
const categoryColumn = document.querySelector(".column.category");
const priceColumn = document.querySelector(".column.price");
const actionColumn = document.querySelector(".column.action");
const textHTML = (textContent) => `<p>${textContent}</p>`;
const checkBoxHTML = `<input type="checkbox"/>`;
const actionsCellHTML =  `
<div class="ellipsis-action">
    <span class="label">...</span>
    <span class="actions">
        <button class="opt edit" title="Editar">
        <img src="../static/img/pencil.webp" alt="">
        </button>
        <button class="opt remove" title="Apagar">
        <img src="../static/img/delete-icon-red.webp" alt="">
        </button>
    </span>
</div>
`

/**
 * Cria uma célula para a tabela.
 * @param {string} id Id da célula
 * @param {string} htmlContent Conteúdo HTML da célula,
 * é adicionado ao fim do elemento.
 * @returns {HTMLDivElement} Célula criada.
 */
function createCell(id, htmlContent, title = "") {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.title = title;
    cell.id = id;
    cell.insertAdjacentHTML("beforeend", htmlContent);
    return cell;
}

/**
 * Retorna um array com todos os elementos em uma coluna.
 * @param {("checkbox" | "name" | "category" | "price" | "action")} columnName
 * @param {boolean} includeHeaders Se deve incluir as células header da coluna.
 * @returns {Element[]} Elementos da coluna.
 */
export function getColumnCells(columnName, includeHeaders = false) {
    const columnsMap = {
        "checkbox": checkboxColumn,
        "name": nameColumn,
        "category": categoryColumn,
        "price": priceColumn,
        "action": actionColumn
    }
    const column = columnsMap[columnName]
    const array = Array.from(column.children);
    if (!includeHeaders)
        array.splice(0, 1);
    return array;
}

/**
 * Adiciona uma linha da tabela.
 * @param {string} id Id da linha
 * @param {string} name Valor para o campo NOME
 * @param {string} category Valor para o campo CATEGORIA
 * @param {string} price Valor para o campo PREÇO.
 */
export function addRow(id, name, category, price, title = "") {
    if (document.getElementById(id) !== null)
        return;
    const checkBoxCell = createCell("checkbox-" + id, checkBoxHTML, title);
    const nameCell = createCell("name-" + id, textHTML(name), title);
    const categoryCell = createCell("category-" + id, textHTML(category), title);
    const priceCell = createCell("price-" + id, textHTML(String(price), title));
    const actionCell = createCell("action-" + id, actionsCellHTML);
    checkboxColumn.appendChild(checkBoxCell);
    nameColumn.appendChild(nameCell);
    categoryColumn.appendChild(categoryCell);
    priceColumn.appendChild(priceCell);
    actionColumn.appendChild(actionCell);
}

/**
 * Retorna um array com os elementos HTML que compõe
 * a linha buscada.
 * @param {string} id Id da linha.
 * @param {boolean} returnArray Se deve retornar como array
 * @returns {Object<string, HTMLElement> | HTMLElement[] | null
 * } Linha encontrada ou null.
 */
export function getRow(id, returnArray = true) {
    id = String(id).replace(/\D+/g, "")
    if (id === "")
        return null;
    const row = {
        checkbox: document.getElementById("checkbox-" + id),
        name: document.getElementById("name-" + id),
        category: document.getElementById("category-" + id),
        price: document.getElementById("price-" + id),
        action: document.getElementById("action-" + id)
    };
    if (Object.values(row).includes(null))
        return null;
    if (Object.keys(row).length === 0)
        return null
    return returnArray? Object.values(row): row;
}

/**
 *
 * @param {string | number} id Id da linha que será deletada.
 */
export function deleteRow(id) {
    const row = getRow(id);
    if (row === null)
        return;
    row.forEach((cell) => {
        cell.remove();
    })
}
/**
 *Lima uma coluna da tabela.
 * @param {("checkbox" | "name" | "category" | "price" | "action")} columnName
 */
function clearColumn(columnName) {
    const cells = getColumnCells(columnName);
    cells.forEach((cell) => cell.remove());
}

/**
 * Limpa todas as colunas da tabela.
 */
export function clearAllColumns() {
    const names = ["name", "price", "category", "checkbox", "action"];
    names.forEach((name) => clearColumn(name));
}

/**
 *
 * @param {Array<HTMLElement>} arr
 * @returns
 */
function _splitCellAndHeader(arr) {
    return [
        arr.filter((e) => e.classList.contains("header")),
        arr.filter((e) => !e.classList.contains("header")),
    ]
}

/**
 * Ordena as colunas com base num callback
 * de organização.
 * @param {undefined | (a: Element, b: Element, sortedColumn: "name" | "category" | "price"
 * ) => number} sortKey Callback usado para organizar
 * as colunas. É um callback chamado em array.sort().
 * @param {"name" | "category" | "price"} sortedColumn Coluna
 * que será organizada.
 */
export function sortColumns(sortKey, sortedColumn) {
    const columns = {
        "name": [nameColumn, 0],
        "category": [categoryColumn, 1],
        "price": [priceColumn, 2]
    }
    const [column, idColumn] = columns[sortedColumn];
    if (column === null)
        return;
    columns.checkbox = [checkboxColumn, 3];
    column.action = [actionColumn, 4];

    const [headers, cells] = _splitCellAndHeader(Array.from(column.children));
    const sortedResults = [];
    cells.sort((a, b) => {
        const result = sortKey(a, b, sortedColumn)
        sortedResults.push(result);
        return result;
    });
    [...headers, ...cells].forEach((cell) => {
        column.appendChild(cell);
    })
    Object.keys(columns).forEach((key) => {
        const otherColumn = columns[key];
        if (otherColumn[1] === idColumn)
            return;
        const [otherHeaders, otherCells] = _splitCellAndHeader(Array.from(otherColumn[0].children));
        let index = 0;
        otherCells.sort(() => sortedResults[index++]);
        [...otherHeaders, ...otherCells].forEach((cell) => {
            otherColumn[0].appendChild(cell);
        });
    })
}

export function hasCheckedRow() {
    const column = getColumnCells("checkbox");
    for (const cell of column) {
        if (cell.querySelector("input")?.checked)
            return true;
    }
    return false;
}
/**
 * Retorna todas as linhas com a coluna `checkbox` marcada.
 * @returns {HTMLDivElement[][] | null} Array com as
 *  linhas obtidas ou null.
 */
export function getCheckedRows() {
    const checkedIds = getColumnCells("checkbox"
    ).filter(
        (cell) => cell.querySelector("input").checked
    ).map((cell) => cell.id);
    const checkedRows = [];
    checkedIds.forEach((id) => checkedRows.push(getRow(id)));
    return checkedRows.length > 0? checkedRows:null;
}

export function countCheckedRows() {
    const column = getColumnCells("checkbox");
    let count = 0;
    for (const cell of column) {
        if (cell.querySelector("input")?.checked)
            count++;
    }
    return count;
}

/**
 *
 * @returns {Array<string>}
 */
export function getAllRowIds() {
    return Array.from(getColumnCells("name")).map((cell) => getIdRowFromElement(cell));
}

export function allRowsHasChecked() {
    const countedRows = countCheckedRows();
    const columnLength = getColumnCells("checkbox").length;
    return countedRows === columnLength;
}

export function getAllRows(inArray = true) {
    const ids = getAllRowIds();
    return ids.map((id) => getRow(id, inArray));
}

export function searchInTable(searchName, searchCategory = null, searchPrice = null, startWith = true, autoRefesh = true) {
    const rows = getAllRows(false);
    const searchRow = rows.filter((row) => {
        /**
         * @type {Object<string, HTMLDivElement>}
         */
        const { name, category, price } = row;
        if (searchName !== null) {
            if (!startWith)
                return price.textContent.toLowerCase() === searchPrice.toLowerCase();
            return name.textContent.toLowerCase().startsWith(searchName.toLowerCase());
        }
        if (searchCategory !== null) {
            if (!startWith)
                return price.textContent.toLowerCase() === searchPrice.toLowerCase();
            return category.textContent.toLowerCase().startsWith(searchCategory.toLowerCase());
        }
        if (searchPrice !== null) {
            if (!startWith)
                return price.textContent.toLowerCase() === searchPrice.toLowerCase();
            return price.textContent.toLowerCase().startsWith(searchPrice.toLowerCase());
        }
        return true;
    });
    console.log(searchRow);
    if (autoRefesh && searchRow.length > 0)
        refeshTable(searchRow);
    return searchRow;
}

document.querySelector("#order-by").addEventListener("change", e => {
    const option = e.target.value;
    const sortKey = sortCallbacks[option];
    if (sortKey === null)
        return;
    sortColumns(sortKey[0], sortKey[1]);
    window.dispatchEvent(closeOverlayEvent);
});

window.searchInTable = searchInTable;

refeshTable();
