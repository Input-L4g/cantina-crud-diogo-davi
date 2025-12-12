export function parseBrazilianDate(title) {
    if (!title.includes("Criado em:")) return null;

    const raw = title.replace("Criado em:", "").trim(); 
    // raw = "11/12/2025 - 08:46:55"

    const [datePart, timePart] = raw.split(" - ");
    const [day, month, year] = datePart.split("/");

    // Criar data ISO: 2025-12-11T08:46:55
    return new Date(`${year}-${month}-${day}T${timePart}`);
}

export function mergeObjectInPlace(o, newObj) {
    for (const key of Object.keys(newObj)) {
        o[key] = newObj[key];
    }
}

export function capitalize(text, full=true) {
    if (!text) return "";
    if (full)
        text = text.toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Procura e retorna um elemento de classe
 * especificada a partir de um elemento filho.
 * @param {HTMLElement} child Elemento filho.
 * @param {string} parentClass Classe de pai procurada.
 * @returns
 */
export function searchParent(child, parentClass) {
    while (child && !child.classList.contains(parentClass)) {
        child = child.parentElement;
    }
    return child
}

/**
 * Retorna o id da linha recebendo qualquer elemento da mesma.
 * @param {HTMLElement} element Elemento da tabela.
 * @returns {string} Id obtido. Se o elemento não
 * for da tabela, o ID retornado é inváldio.
 */
export function getIdRowFromElement(element) {
    if (element === null || !/\d/.test(element.id))
        return null;
    return element.id.replace(/\D+/g, "");
}

/**
 * Aplica callback para vários elementos sob vários eventos.
 * Para ter um funcionamento dinâmico, deve-se seguir as regras impostas
 * em cada parâmetro.
 *
 * **WARNING**: Ao menos um dos parâmetros deve ser um Array.
 * @param {EventTarget[] | EventTarget | null} htmlElements Elementos que terão um listener com o
 * callback. Pode ser qualquer objeto que tenha o método addEventListener. Se
 * for um array, será aplicado o callback normalmente, seguindo o descrito no parâmetro `eventsString`.
 * Se for null, será usado `document` como elemento.
 * @param {string[] | string} eventsString Os eventos para cada elemento em `htmlElement`,
 * respectivamente. Se não for um array, será aplicado o mesmo evento para
 * todos os elementos.
 * @param {Function[] | Function} callbacks Callback que será aplicado para
 * cada elemento com index corresponte. Se não for um array, o mesmo callback
 * será aplicado para todos os elementos, de acordo com as regras descritas
 * nos outros parâmetros.
 */
export function applyCallbackInElements(eventsString, callbacks, htmlElements) {
    if (!(typeof htmlElements.forEach === 'function')) {
        /**
         * Função de auxilio para forEach nessa função.
         * Segue no modo em que `htmlElements` não é um Array.
         * @param {any[]} arr Array percorrido
         * @param {Function | Function[]} callback_ Callback que será aplicado.
         * Se null, será usado os valores em `arr`, caso
         * contrário, será percorrido conforme o index de `arr`,
         * se não for um Array, será aplicado para todos os eventos.
         * @param {string | string[]} event_ Evento que do elemento que
         * terá o callback aplicado. Segue a mesma regra descrita em `callback_`.
         * @param {EventTarget} affectedElement Elemento que terá o evento escutado com
         * o callback correspondente.
         */
        function applyAuxForEach(affectedElement, arr, callback_ = null, event_ = null) {
            console.log(affectedElement);
            console.log(arr);
            arr.forEach((indefined, i) => {
                const callback = callback_ === null? indefined:getElementIfIsArray(callback_, i);
                const event = event_ === null? indefined:getElementIfIsArray(event_, i)
                affectedElement.addEventListener(event, (e) => callback(e));
            });
        }
        if (htmlElements === null)
            htmlElements = document;
        if (Array.isArray(callbacks)) // Aplica o listerner com todos os callbacks
            applyAuxForEach(htmlElements, callbacks, null, eventsString);
        else // Aplica o listerner com todos os eventos
            applyAuxForEach(htmlElements, eventsString, callbacks, null);
    }
    htmlElements.forEach(
        /**
         * @param {EventTarget} element Elemento da lista de referência.
         * @param {number} i Index
         */
        (element, i) => {
        const event = getElementIfIsArray(eventsString, i);
        const callback = getElementIfIsArray(callbacks, i);
        element.addEventListener(event, (e) => callback(e));
    });
}

/**
 * Retorna o valor num index procurado em um Array
 * caso o objeto analisado seja de fato um Array,
 * caso contrário, retornará o fallback.
 * @param {Array<any> | any} arr Array analisado.
 * @param {number} index Index procurado.
 * @param {any} fallback Retorno fallback caso o `arr` não seja um Array.
 * @returns {any} O valor do index ou o fallback. Se o valor de
 * fallback for literal "null", será retorna o parâmetro `arr`.
 */
export function getElementIfIsArray(arr, index, fallback="null") {
    if (Array.isArray(arr))
        return arr[index];
    if (fallback === "null")
        fallback = arr;
    return fallback
}
