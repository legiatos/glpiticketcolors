# glpiticketcolors
## Goal
This plugin goal is to have different ticket colors depending on who it is attributed to

## Installation
To install the plugin, you have to have a GLPI app installed, using version 10.0.0 or higher.

You can then clone the project into `glpi/plugins`.

My setup is weird, you might have to go to `glpi/public` and create a symbolic link pointing to ../plugins:
```bash
ln -s ../plugins plugins
```

Then, on GLPI, with an admin profile, you can go to `Configuration > Plugins` and install and enable the plugin.
