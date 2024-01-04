(function(scope) {
    "use strict";

    const { app, Menu, MenuItem, BrowserWindow } = require('electron');


    var template = [
        {
            label: "&" + _('LLM Settings'),
            submenu: [
                {
                    label: _('Settings'),
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        let settingsWindow = new BrowserWindow({
                            width: 800,
                            height: 900,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false
                            }
                        });
                        settingsWindow.loadFile('html/settings.html');

                        const contextMenu = new Menu();
                        contextMenu.append(new MenuItem({ role: 'undo' }));
                        contextMenu.append(new MenuItem({ role: 'redo' }));
                        contextMenu.append(new MenuItem({ type: 'separator' }));
                        contextMenu.append(new MenuItem({ role: 'cut' }));
                        contextMenu.append(new MenuItem({ role: 'copy' }));
                        contextMenu.append(new MenuItem({ role: 'paste' }));
                        contextMenu.append(new MenuItem({ type: 'separator' }));
                        contextMenu.append(new MenuItem({ role: 'selectAll' }));
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
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
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
