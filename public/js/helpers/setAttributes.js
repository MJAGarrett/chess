/**
 * 
 * @param {HTMLElement} elem An HTML element.
 * @param {String[][]} attrs An array of two-element arrays representing the attribute to set and its value.
 */
export default function setAttributes(elem, attrs) {

	attrs.forEach((attr) => {
		if (attr.length === 2)
			elem.setAttribute(attr[0], attr[1]);
		else
			elem.setAttribute(attr[0], "");
	});
}