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
function applyTechColorsTickets() {
	const table = document.querySelector('table[data-testid="search-results"]');
	if (!table) return;

	const rows = table.querySelectorAll('tbody tr');

	rows.forEach(row => {
		const cell = row.querySelector('[data-searchopt-content-id="8"]');
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
 * Applique les couleurs sur la vue Kanban en extrayant les équipes des tooltips
 */
function applyTechColorsKanban() {
	// On cible les cartes du Kanban
	setTimeout(()=>{

		const cards = document.querySelectorAll('.kanban-item');
		if (cards.length === 0) return;

		cards.forEach(card => {
			// On prend les équipes
			const teamIcons = card.querySelectorAll('.kanban-item-team i[title]');

			let teams = [];
			teamIcons.forEach(icon => {
				const teamName = icon.getAttribute('title').trim();
				if (teamName) {
					teams.push(teamName);
				}
			});


			// Si il y a des équipes, on colore
			if (teams.length > 0) {
				const teamKey = teams.sort().join("\n");

				// Gestion des couleurs
				if (!(teamKey in techColorsCache)) {
					techColorsCache[teamKey] = getRandomColor();
					saveColor(teamKey, techColorsCache[teamKey]);
				}

				const targetColor = techColorsCache[teamKey];

				card.style.setProperty('background-color', targetColor, 'important');

				card.style.setProperty('color', '#000000', 'important');

				card.style.setProperty('box-shadow', 'none', 'important');

				const cardBody = card.querySelector('.kanban-item.card');
				if (cardBody) {
					cardBody.style.setProperty('background-color', 'transparent', 'important');
				}
			}
		});
	}, 500);
}

/**
 * Point d'entrée du script
 */
async function init() {
	const success = await loadColors();
	if (success) {
		const urlParams = new URLSearchParams(window.location.search);
		const isKanban = urlParams.get("as_map") === 0 && urlParams.get("browse") === 0;

		if (window.location.pathname.includes("ticket")) {
			applyTechColorsTickets();
			applyTechColorsKanban();
			startMutationObserver();

		}
	}
}

/**
 * Update de l'observer pour être plus réactif sur le Kanban
 */
function startMutationObserver() {
	const targetNode = document.getElementById('page');
	if (!targetNode) return;

	const observer = new MutationObserver(() => {
		clearTimeout(window.glpiColorTimeout);
		window.glpiColorTimeout = setTimeout(() => {
			applyTechColorsTickets();
			applyTechColorsKanban();
		}, 300);
	});

	observer.observe(targetNode, { childList: true, subtree: true });
}

/**
 * Point d'entrée si la page est chargée
 */
$(document).ready(function() {
	init();
});
