function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

(function() {

	// On vire la class bootstrap
	const table = document.querySelector('table[data-testid="search-results"]');
	if (table) table.classList.remove('table-striped');

	const rows = document.querySelectorAll('table[data-testid="search-results"] tbody tr');
	let colors = {"": ""};

	rows.forEach(row => {
		const cell = row.querySelector('[data-searchopt-content-id="5"]');

		if (cell) {
			const text = cell.innerText;
			if (!(text in colors)) {
				colors[text] = getRandomColor();
			}

			let targetColor = colors[text];

			if (targetColor !== "") {
				Array.from(row.cells).forEach(td => {
					// On met les couleurs
					td.style.setProperty('background-color', targetColor, 'important');
					// td.style.setProperty('color', '#FFFFFF', 'important');
					// td.style.setProperty('background-image', 'none', 'important');
				});
			}
		}
	});
})();
