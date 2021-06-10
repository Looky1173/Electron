document.addEventListener('DOMContentLoaded', function () {
    const { contextBridge, ipcRenderer } = require("electron");
    window.ipcRenderer = ipcRenderer;

    const version = document.getElementById('version');

    window.ipcRenderer.send('app_version');
    window.ipcRenderer.on('app_version', (event, arg) => {
        window.ipcRenderer.removeAllListeners('app_version');
        version.innerText = 'Version ' + arg.version;
    });

    const notification = document.getElementById('notification');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restart-button');
    window.ipcRenderer.on('update_available', () => {
        window.ipcRenderer.removeAllListeners('update_available');
        message.innerText = 'A new update is available. Downloading now...';
        notification.classList.remove('hidden');
    });
    window.ipcRenderer.on('update_downloaded', () => {
        window.ipcRenderer.removeAllListeners('update_downloaded');
        message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
        restartButton.classList.remove('hidden');
        notification.classList.remove('hidden');
    });

    function closeNotification() {
        notification.classList.add('hidden');
    }
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
                'destroy-splash-screen'
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
                'update-error'
            ];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    });
});