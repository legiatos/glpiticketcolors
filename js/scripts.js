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
 * @param name la clé
 * @param color la couleur (objet RGB)
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
				// Si nouveau group, on attribue et on sauve
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
 * Applique les couleurs sur la vue Kanban en extrayant les équipes
 */
function applyTechColorsKanban() {
	// On cible les cartes du Kanban
	setTimeout(()=>{

		const cards = document.querySelectorAll('.kanban-item');
		if (cards.length === 0) return;
		cards.forEach(card => {

			// On prend les équipes
			const teamIcons = card.querySelectorAll('.kanban-item-team i[title], .kanban-item-team i[data-bs-original-title]');
			let teams = [];
			teamIcons.forEach(icon => {
				const text = icon.getAttribute('title') || icon.getAttribute('data-bs-original-title')
				const teamName = text.trim();
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
		if (window.location.pathname.includes("ticket")) {

			applyTechColorsTickets();
			applyTechColorsKanban();
			startMutationObservers();
		}
	}
}

/**
 * Permet de recolorer à chaque changement du DOM
 */
function startMutationObservers() {

	const targetNode = document.querySelector(".table-responsive-lg") || document.body;

	// A chaque fois qu'il y a un changement, on prend la liste des changements
	// /!\ A chaque fois que ca s'actualise tout seul et qu'il ny a pas dechangements, les couleurs disparaissent
	const observer = new MutationObserver((mutations) => {
		let shouldRefresh = false;

		// Pour chaque changement
		for (let mutation of mutations) {
			// Si la mutation touche la class
			if (mutation.type === 'attributes' && mutation.attributeName==='class') {

				// Si on ouvre une colonne
				const isColumn = mutation.target.classList.contains('kanban-column');
				const isNowOpen = !mutation.target.classList.contains('collapsed');

				if (isColumn && isNowOpen) {
					// On doit refresh
					shouldRefresh = true;
					break;
				}
			}

			// Si on ajoute des trucs (des tickets dans ce cas là
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				// On doit refresh
				shouldRefresh = true;
				break;
			}

		}


		// On refresh
		if (shouldRefresh) {
			clearTimeout(window.glpiColorTimeout);
			window.glpiColorTimeout = setTimeout(() => {
				applyTechColorsKanban();
				applyTechColorsTickets();
			}, 500);
		}
	});


	observer.observe(targetNode, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['class', 'style']
	});
}

/*
 * Point d'entrée si la page est chargée
 */
$(document).ready(function() {
	init();
});
