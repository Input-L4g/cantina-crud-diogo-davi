import { globalDialog, globalOverlay, globalDialogContainer } from "./globals.js";
import { openDialogEvent } from "./events.js";
import { loadDialogContent } from "./dialog.js";

const closedDialogOpacity = "0";
const openedDialogOpacity = "1";

const dialogTransitionDuration = Number(
    getComputedStyle(globalDialogContainer)
    .transitionDuration
    .trim()
    .replace(/[^0-9.]/g, "") // Deixa apenas pontos e números
    .replace(/^(?!0\.)\./, "0.") // Adiciona um zero a antes de qualquer ponto
) * 1000;

const onOpenOverlayZIndex = window.getComputedStyle(globalDialog).zIndex - 1;
const onCloseOverlayZIndex = -1;
let overlayIsOpen = false;
let timeOutId = null;

/**
 * Callback para abrir o dialog.
 */
function onOpenDialog() {
    globalDialog.show();
    globalDialogContainer.style.opacity = openedDialogOpacity;
    document.dispatchEvent(openDialogEvent);
}

/**
 * Callback ao para fechar o dialog.
*/
function onCloseDialog() {
    globalDialog.close()
}

/**
 * Callback responsável por **abrir** o `overlay` global e a tag `dialog` global
 * da página.
 * @param {CustomEventInit} event Alvo que disparou o evento.
 */
export function onOpenOverlay(event) {
    if (!overlayIsOpen){
        /** @type {HTMLElement} */
        const target = event.detail.target
        globalOverlay.style.zIndex = onOpenOverlayZIndex;
        if (!globalDialog.open) {
            onOpenDialog();
            loadDialogContent(
                target.id || target.classList[target.classList.length - 1],
                event.detail.payload
            );
        }
        overlayIsOpen = true
    }
}

/**
 * Callback responsável por **fechar** o `overlay` global e a tag `dialog` global
 * da página.
 */
export function onCloseOverlay() {
    if (overlayIsOpen && timeOutId === null) {
        console.log("FECHANDO OVERLAY")
        if (globalDialog.open)
            globalDialogContainer.style.opacity = closedDialogOpacity;
        timeOutId = setTimeout(
            () => {
                globalOverlay.style.zIndex = onCloseOverlayZIndex;
                if (globalDialog.open)
                    onCloseDialog();
                overlayIsOpen = false;
                timeOutId = null;
            }, dialogTransitionDuration
        )
    }
}
