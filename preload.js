document.addEventListener('DOMContentLoaded', function () {
    const { contextBridge, ipcRenderer, shell } = require("electron");
    //window.ipcRenderer = ipcRenderer;
/*
    const version = document.getElementById('version');

    window.ipcRenderer.send('app_version');
    window.ipcRenderer.on('app_version', (event, arg) => {
        window.ipcRenderer.removeAllListeners('app_version');
        version.innerText = 'Version ' + arg.version;
    });
*/
    function restartApp() {
        ipcRenderer.send('restart-app');
    }
    contextBridge.exposeInMainWorld('api', {
        restartApp: () => restartApp(),
        shell: {
            openExternal: (address) => shell.openExternal(address)
        },
        send: (channel, data) => {
            console.log("Send on channel " + channel)
            // Whitelist channels
            let validChannels = [
                'check-for-updates',
                'launch-app',
                'get-version'
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, callback) => {
            console.log("Receive on channel " + channel)
            let validChannels = [
                'update-available',
                'update-not-available',
                'download-progress',
                'update-downloaded',
                'update-error',
                'version'
            ];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => callback(...args));
            }
        }
    });
});