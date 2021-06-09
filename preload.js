document.addEventListener("DOMContentLoaded", function () {
    const { ipcRenderer } = require("electron");
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
});