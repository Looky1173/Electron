document.addEventListener('DOMContentLoaded', function () {
    const { contextBridge, ipcRenderer } = require("electron");
    window.ipcRenderer = ipcRenderer;
/*
    const version = document.getElementById('version');

    window.ipcRenderer.send('app_version');
    window.ipcRenderer.on('app_version', (event, arg) => {
        window.ipcRenderer.removeAllListeners('app_version');
        version.innerText = 'Version ' + arg.version;
    });
*/
    function restartApp() {
        window.ipcRenderer.send('restart_app');
    }
    contextBridge.exposeInMainWorld('api', {
        restartApp: () => restartApp(),
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
        receive: (channel, func) => {
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
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    });
});