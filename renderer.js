document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('restart-button').addEventListener('click', function () {
        window.api.restartApp();
    });
});