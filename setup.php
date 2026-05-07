<?php

define('COLORTICKETS_VERSION', '1.0.1');

function plugin_init_colortickets() {
	global $PLUGIN_HOOKS;

	$PLUGIN_HOOKS['csrf_compliant']['colortickets'] = true;

	// C'est ici qu'on demande à GLPI d'appeler notre fonction d'injection
	if (Session::getLoginUserID()) { // faire en sorte que se soit que sur la page de tickets
		$PLUGIN_HOOKS['add_javascript']['colortickets'][] = "js/scripts.js";
	}
}

function plugin_version_colortickets() {
	return [
		'name'           => 'Color Tickets',
		'version'        => COLORTICKETS_VERSION,
		'author'         => 'Simon Krumb',
		'license'        => 'GPLv2+',
		'homepage'       => 'https://github.com/legiatos/glpiticketcolors',
		'min_glpi_version' => '10.0'
	];
}
