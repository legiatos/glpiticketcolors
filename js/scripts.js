/**
 * Genere une couleur aléatoire pastel
 */
function getRandomColor() {
	const mix = 180;
	const r = Math.floor((Math.random() * (255 - mix)) + mix);
	const g = Math.floor((Math.random() * (255 - mix)) + mix);
	const b = Math.floor((Math.random() * (255 - mix)) + mix);
	return `rgb(${r}, ${g}, ${b})`;
}

let techColorsCache = {};
let isSaving = false;

/**
 * Charge les couleurs depuis le backend
 * @returns {Promise<boolean>}
 */
async function loadColors() {
	try {
		const response = await fetch('/glpi/public/plugins/colortickets/handler/handler.php');
		if (!response.ok) throw new Error('Erreur réseau');
		techColorsCache = await response.json();
		return true;
	} catch (e) {
		console.error("Erreur chargement JSON", e);
		return false;
	}
}

/**
 * Sauvegarde les couleurs dans le backend
 * @param name
 * @param color
 * @returns {Promise<void>}
 */
async function saveColor(name, color) {
	if (isSaving) return;
	isSaving = true;
	try {
		await fetch('/glpi/public/plugins/colortickets/handler/handler.php', {
			method: 'POST',
			body: JSON.stringify({ [name]: color })
		});
	} finally {
		isSaving = false;
	}
}

/**
 * Applique les couleurs aux lignes appropriées
 */
function applyTechColors() {
	const table = document.querySelector('table[data-testid="search-results"]');
	if (!table) return;

	const rows = table.querySelectorAll('tbody tr');

	rows.forEach(row => {
		const cell = row.querySelector('[data-searchopt-content-id="5"]');
		if (cell) {
			const text = cell.innerText.trim();
			if (text !== "") {
				// Si nouveau tech, on attribue et on sauve
				if (!(text in techColorsCache)) {
					techColorsCache[text] = getRandomColor();
					saveColor(text, techColorsCache[text]);
				}

				let targetColor = techColorsCache[text];
				Array.from(row.cells).forEach(td => {
					td.style.setProperty('background-color', targetColor, 'important');
					td.style.setProperty('color', '#000000', 'important');
					td.style.setProperty('box-shadow', 'none', 'important');
					td.style.setProperty('background-image', 'none', 'important');
				});
			}
		}
	});
}

/**
 * Lanceur principal
 */
async function init() {
	const success = await loadColors();
	if (success) {
		applyTechColors();
		startMutationObserver();
	}
}

/**
 * Observe les changement pour garder les couleurs si on trie ou que GLPI actualise
 */
function startMutationObserver() {
	const targetNode = document.getElementById('page');
	if (targetNode) {
		const observer = new MutationObserver(() => {
			clearTimeout(window.glpiColorTimeout);
			window.glpiColorTimeout = setTimeout(applyTechColors, 300);
		});
		observer.observe(targetNode, { childList: true, subtree: true });
	}
}

/**
 * Point d'entrée si la page est chargée
 */
$(document).ready(function() {
	init();
});
