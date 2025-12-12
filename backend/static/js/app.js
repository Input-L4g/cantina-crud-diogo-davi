import { API_URL } from "./globals.js";

const API_PRODUCT_URL = API_URL + "products";
const API_TEST_URL = API_URL + "test";

async function testConnection() {
    try {
        // GET
        let response = await fetch(API_TEST_URL, { method: "GET" });
        let test = await response.json();
        if (!test.success) console.log("FALHA (GET):", test.message);

        // DELETE
        response = await fetch(API_TEST_URL, { method: "DELETE" });
        test = await response.json();
        if (!test.success) console.log("FALHA (DELETE):", test.message);

        // POST
        response = await fetch(API_TEST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: "CONTEÚDO TESTE" })
        });
        test = await response.json();
        if (!test.success) console.log("FALHA (POST):", test.message);

        // PUT
        response = await fetch(API_TEST_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: "CONTEÚDO TESTE" })
        });
        test = await response.json();
        if (!test.success) console.log("FALHA (PUT):", test.message);
    } catch (e) {
        if (e.message === "Failed to fetch") {
            console.log("A API NÃO ESTÁ RODANDO!")
        } else {
            console.log("ERRO INTERNO:\n", e.message || e);
        }
        return false;
    }
    return true;
}

/**
 * Testa a conexão com o DB.
 * @returns {boolean} Resultado do teste.
 */
async function testDBConnection() {
    try {
        // GET
        let response = await fetch(API_TEST_URL + "/db", { method: "GET" });
        let test = await response.json();
        if (!test.success) console.log("FALHA (GET):", test.message);
    } catch (e) {
        if (e.message === "Failed to fetch") {
            console.log("A API NÃO ESTÁ RODANDO!");
        } else {
            console.log("ERRO INTERNO:\n", e.message || e);
        }
        return false;
    }
    return true;
}

/**
 * Cria uma requisição JSON
 * @param {"GET" | "POST" | "PUT" | "DELETE"} requestMethod Método da requisição.
 * @param {any} payload Conteúdo do body.
 * @returns
 */
function JSONRequest(requestMethod, payload = null) {
	const request =  {
		method: requestMethod,
		headers: {
			"Content-Type": "application/json",
		}
	};
    if (payload)
        request.body = JSON.stringify(payload);
    return request;
}
/**
 * Pega uma resposta de uma requisição.
 * @param {string} url URL da API.
 * @param {Object} requestJSON JSON de requisição.
 * @returns {Promise<any>} Retorno com .json() da resposta.
 */
export async function getResponse(url, requestJSON) {
    const response = await fetch(url, requestJSON);
    if (response.status === 204)
        return null;
    return response.json();
}
/**
 * Adiciona um produto no DB.
 * @param {string} name Nome do produto.
 * @param {string} category Categoria do produto.
 * @param {string | number} price Preço do produto
 * @returns
 */
export async function addProductRequest(name, category, price) {
    try {
        price = Number(price);
        if (isNaN(price))
            throw Error("O tipo para `price` deve ser um número ou texto convertivel para número.")
        const request = JSONRequest("POST", {name, category, price});
        const response = await getResponse(API_PRODUCT_URL, request);

        if (response.success) {
            console.log(response?.message);
        } else {
            console.log(response.error?.type, response.error?.message);
        }
        return response;
    } catch (error) {
        console.error('API Request Error:', error);
    }
}
/**
 *Remove um produto do DB.
 * @param {string} id Id do produto procurado.
 */
export async function removeProductRequest(id) {
    try {
        const request = JSONRequest("DELETE");
        const response = await getResponse(`${API_PRODUCT_URL}/${id}`, request);
        if (response.success) {
            console.log("SUCESSO:", response.message);
        } else {
            console.log("ERROR:", response.error?.type, response.error?.message);
        }
        return response;
    } catch (error) {
        console.log("ERRO INTERNO:", error.message || error);
    }
}
/**
 * Pega os produtos do DB.
 * @param {string | null} id Id do produto procurado. Se null, será
 * buscado todos os produtos.
 */
export async function getProductRequest(id = null) {
    try {
        const request = JSONRequest("GET");
        const url = id === null? API_PRODUCT_URL:`${API_PRODUCT_URL}/${id}`;
        const response = await getResponse(url, request);
        if (response === null)
            return null;
        if (response.success) {
            console.log("SUCESSO:", response.message);
        } else {
            console.log("ERROR:", response.error?.type, response.error?.message);
        }
        return response;
    } catch (error) {
        console.log("ERRO INTERNO:", error.message, error);
    }
}
/**
 * Atualiza um produto no DB.
 * @param {string} id Id do produto que será atualizado.
 * @param {string} name Novo nome do produto.
 * @param {string} category Nova categoria do produto.
 * @param {string} price Novo preço do produto.
 */
export async function updateProductRequest(id, name = null, category = null, price = null) {
    try {
        if (name === null && category === null && price === null)
            throw Error("Ao menos um campo deve ser válido.");
        price = Number(price);
        if (isNaN(price))
            throw Error("O tipo para `price` deve ser um número ou texto convertivel para número.")
        const payload = {};
        if (name)
            payload.name = name;
        if (category)
            payload.category = category;
        if (price)
            payload.price = price;
        const request = JSONRequest("PUT", payload);
        const response = await getResponse(`${API_PRODUCT_URL}/${id}`, request);
        if (response.success) {
            console.log("SUCESSO:", response.message);
        } else {
            console.log("ERROR:", response.error?.type, response.error?.message);
        }
        return response;
    } catch (error) {
        console.log("ERRO INTERNO:", error.message || error);
    }
}

window.addProductRequest = addProductRequest;
window.removeProductRequest = removeProductRequest;
window.getProductRequest = getProductRequest;
window.updateProductRequest = updateProductRequest;
window.testConnection = testConnection;
window.testDBConnection = testConnection;
