# Site IP

![Screenshot](https://addons.cdn.mozilla.net/user-media/previews/full/229/229056.png)

Firefox extension that shows the site's IP address in the browser's address bar. Just hover your mouse over the icon to display it or click to copy.

You can install it from [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/site-ip/).

For faster IP display on hover open `about:config` and add the preference `ui.tooltipDelay` with the type `Number` and the value `100` (default is [500](https://developer.mozilla.org/en-US/docs/Mozilla/Preferences/Preference_reference/ui.tooltipDelay)).

To adapt the icon color to the theme color open `about:config`, find option `svg.context-properties.content.enabled` and change it to `true`. See [bug #1377302](https://bugzilla.mozilla.org/show_bug.cgi?id=1377302).
