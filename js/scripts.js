// Fonction pour générer une couleur (la tienne, inchangée)
function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}


window.techColorsCache = {"": ""};

function applyTechColors() {
	const table = document.querySelector('table[data-testid="search-results"]');
	if (!table) return;

	const rows = table.querySelectorAll('tbody tr');

	rows.forEach(row => {
		// On recupère la cellule
		const cellTech = row.querySelector('[data-searchopt-content-id="5"]');

		if (cellTech) {
			const text = cellTech.innerText.trim();

			// S'il y a un technicien
			if (text !== "") {

				// Si le technicien n'existe pas, on lui donne une couleur
				if (!(text in window.techColorsCache)) {
					window.techColorsCache[text] = getRandomColor();
				}

				let targetColor = window.techColorsCache[text];

				// On applique la couleur sur les cellules
				Array.from(row.cells).forEach(td => {
					// On force le fond
					td.style.setProperty('background-color', targetColor, 'important');

					// On supprime les ombres sinon ca enleve la couleur
					td.style.setProperty('box-shadow', 'none', 'important');


				});
			} else {
				// Pour les lignes sans personne, on met le style par defaut de bootstrap
				Array.from(row.cells).forEach(td => {
					td.style.removeProperty('background-color');
					td.style.removeProperty('box-shadow');
					td.style.removeProperty('border-color');
				});
			}
		}
	});
}



(function() {
	if (document.readyState === 'loading') {
		// Pour que quand ca a finis de charger on change les couleurs
		window.addEventListener('DOMContentLoaded', applyTechColors);
	} else {
		applyTechColors();
	}


	// On regarde si ca change pour remettre les couleurs quand il faut
	const targetNode = document.getElementById('page');
	if (targetNode) {
		const observer = new MutationObserver((mutations) => {
			// Pour eviter que ca execute le script en boucle
			clearTimeout(window.glpiColorTimeout);
			window.glpiColorTimeout = setTimeout(applyTechColors, 300);
		});

		observer.observe(targetNode, { childList: true, subtree: true });
	}
})();
