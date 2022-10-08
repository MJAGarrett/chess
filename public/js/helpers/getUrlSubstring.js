/**
 * Gets the final field from the end of the url string.
 * @param {String} url The url to search
 */
export default function getURLEnd(url) {
	const sections = url.split("/");
	return sections[sections.length - 1];
}