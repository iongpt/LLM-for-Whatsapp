(function(scope) {
    "use strict";

    var template = [
        {
            label: "&" + _('LLM Settings'),
            submenu: [
                {
                    label: _('Settings'),
                    accelerator: 'CmdOrCtrl+,',
                    click: function () {
                        console.log("Settings");
                    }
                }
            ]
        },
        {
            label: "&" + _('LLM Chat'),
            submenu: [
                {
                    label: _('Contacts'),
                    accelerator: 'CmdOrCtrl+R',
                    click: function(item) {
                        console.log(item);
                    }
                }

            ]
        },
    ];

    if (process.platform == 'darwin') {
        var name = 'LLM for WhatsApp';
        template.unshift({
            label: "&" + name,
            submenu: [
                {
                    label: _('About') + " " + name,
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    label: _('Quit'),
                    accelerator: 'Command+Q',
                    click: () => { require('electron').app.quit() }
                },
            ]
        });

    } else if (process.platform == 'linux' || process.platform == 'win64' || process.platform == 'win32') {
        template.unshift({
            label: '&File',
            submenu: [
                {
                    label: _('About'),
                    click: () => { global.about.init(); }
                },
                {
                    label: _('Quit'),
                    accelerator: 'Ctrl+Q',
                    click: () => { require('electron').app.quit() }
                },
            ]
        });
    }

    module.exports = template;

})(this);
