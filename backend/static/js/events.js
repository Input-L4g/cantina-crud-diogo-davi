import { globalOverlay, minScrollForAllDown, globalListenerArgs } from "./globals.js";
import { onOpenOverlay, onCloseOverlay } from "./overlay.js";
import { getColumnCells, hasCheckedRow, allRowsHasChecked, getAllRowIds } from "./table.js";
import { submitNewProduct, submitUpdateProduct, submitDeleteProduct } from "./submit.js";

/** @param {any} detail Informação extra para o evento. */
export const openOverlayEvent = (detail) => new CustomEvent("openOverlay", {detail});
export const closeOverlayEvent = new Event("closeOverlay");
export const openDialogEvent = new Event("openDialog");
export const toTopEvent = new Event("toTop");
export const checkAllCheckBoxEvent = new Event("checkAllCheckBox");
export const uncheckAllCheckBoxEvent = new Event("uncheckAllCheckBox");
export const anyCheckBoxHasCheckedEvent = new Event("anyCheckBoxHasChecked");
export const anyCheckBoxHasUncheckedEvent = new Event("anyCheckBoxHasUnchecked");
export const closeLoadingEvent = new Event("closeLoading");
export const submitProductEvent = (detail) => new CustomEvent("submitProduct", {detail});
export const removeProductEvent = (detail) => new CustomEvent("removeProduct", {detail});

export function loadEventListeners() {
    const args = globalListenerArgs;
    window.addEventListener("openOverlay", onOpenOverlay);
    window.addEventListener("closeOverlay", onCloseOverlay);
    window.addEventListener("toTop", () => window.scrollTo(
        {top: 0, behavior: "smooth"})
    )
    window.addEventListener("scroll", () => {
        /** @type {HTMLButtonElement} */
        const btn = args.toTopButton
        if (window.scrollY > minScrollForAllDown)
            btn.style.display = "block";
        else
            btn.style.display = "none";
    });
    window.addEventListener("checkAllCheckBox", () => {
        const cellCheckboxs = getColumnCells("checkbox");
        cellCheckboxs.forEach((cell) => {
            const checkBox = cell.querySelector("input");
            checkBox.checked = true;
        })
        window.dispatchEvent(anyCheckBoxHasCheckedEvent);
    })
    window.addEventListener("uncheckAllCheckBox", () => {
        const cellCheckboxs = getColumnCells("checkbox");
        cellCheckboxs.forEach((cell) => {
            const checkBox = cell.querySelector("input");
            checkBox.checked = false;
        })
        window.dispatchEvent(anyCheckBoxHasUncheckedEvent);
    })
    getColumnCells("checkbox").forEach((cell) => {
        const checkbox = cell.querySelector("input");
        checkbox.addEventListener("change", () => {
            if (checkbox.checked)
                window.dispatchEvent(anyCheckBoxHasCheckedEvent);
            else
                window.dispatchEvent(anyCheckBoxHasUncheckedEvent);
        });
    });
    window.addEventListener("anyCheckBoxHasChecked", () => {
        if (allRowsHasChecked())
            args.allCheckBoxButton.checked = true;
        args.headerNameDeleteSelected.classList.add("active");
    });
    window.addEventListener("anyCheckBoxHasUnchecked", () => {
        args.allCheckBoxButton.checked = false;
        if (!hasCheckedRow()) {
            args.headerNameDeleteSelected.classList.remove("active");
        }
    });
    globalOverlay.addEventListener("click", (e) => {
        if (e.target === globalOverlay)
            window.dispatchEvent(closeOverlayEvent);
    });
    window.addEventListener("submitProduct", (e) => {
        const submitType = e.detail.submitType;
        console.log(e.target);
        /** @type {Object<string, string>} */
        const { id, name, category, price } = e.detail.productData;
        if (submitType === "update") {
            submitUpdateProduct(id, name.toLowerCase(), category.toLowerCase(), Number(price));
        } else if (submitType === "add") {
            submitNewProduct(name.toLowerCase(), category.toLowerCase(), Number(price));
        }
    });
    window.addEventListener("removeProduct", (e) => {
        const id = e.detail.productData.id;
        const rowsIds = getAllRowIds();
        if (e.detail.submitType === "delete-selected") {
            id.forEach((id_, i, arr) => {
                if (!rowsIds.includes(id_)) {
                    return;
                }
                if (i === arr[arr.length - 1])
                    submitDeleteProduct(id_);
                submitDeleteProduct(id_, false)
            })
        }
        else if (typeof id === "string") {
            if (!rowsIds.includes(id)) {
                return;
            }
            submitDeleteProduct(id);
        }
    })
    window.addEventListener("closeLoading", () => onCloseOverlay);
}
