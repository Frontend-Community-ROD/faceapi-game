/**
 * Sets an h2 tag containing any given text
 * @param {string} tag The tag
 * @param {string} text The text
 * @param {string} [className = undefined] The class name
 * @returns The h2 tag
 */
export function setTextElement(tag, text, className) {
    const element = document.createElement(tag);
    element.classList.add(className);
    element.innerText = text;
    return element;
}
