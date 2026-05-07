# glpiticketcolors
## Summary
This plugin goal is to have different ticket colors depending on who it is attributed to.
This is under development.
You can use it however you want, but it will probably not be updated.

## Installation
To install the plugin, you have to have a GLPI app using version __10.0.0__ or higher.

You can then clone the project into `glpi/plugins`.

The setup is not optimal, if you have error reaching the `scripts.js`, you might have to go to `glpi/public` and create a symbolic link pointing to `../plugins`:
```bash
ln -s ../plugins plugins
```

Then, on GLPI, with an admin profile, you can go to `Configuration > Plugins` and install and enable the plugin.
